﻿using Abp;
using Abp.Collections.Extensions;
using Abp.Dependency;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Uow;
using Abp.Events.Bus;
using Abp.Events.Bus.Entities;
using Abp.Extensions;
using Abp.Runtime.Session;
using Abp.Timing;
using Castle.Core.Logging;
using NHibernate;
using NHibernate.Collection;
using NHibernate.SqlCommand;
using NHibernate.Type;
using Shesha.NHibernate.UoW;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Shesha.NHibernate.Interceptors
{
    public class SheshaNHibernateInterceptor : EmptyInterceptor
    {
        public IEntityChangeEventHelper EntityChangeEventHelper { get; set; }

        private readonly IIocManager _iocManager;
        private readonly Lazy<IAbpSession> _abpSession;
        private readonly Lazy<IGuidGenerator> _guidGenerator;
        private readonly Lazy<IEventBus> _eventBus;
        public ILogger Logger { get; set; } = new NullLogger();

        public EntityHistory.IEntityHistoryHelper EntityHistoryHelper => (_iocManager.Resolve<IUnitOfWorkManager>().Current as NhUnitOfWork)?.EntityHistoryHelper as EntityHistory.IEntityHistoryHelper;
        public ISession Session => (_iocManager.Resolve<IUnitOfWorkManager>().Current as NhUnitOfWork)?.GetSession(true);

        public SheshaNHibernateInterceptor(IIocManager iocManager)
        {
            try
            {
                _iocManager = iocManager;

                _abpSession =
                    new Lazy<IAbpSession>(
                        () => _iocManager.IsRegistered(typeof(IAbpSession))
                            ? _iocManager.Resolve<IAbpSession>()
                            : NullAbpSession.Instance,
                        isThreadSafe: true
                        );
                _guidGenerator =
                    new Lazy<IGuidGenerator>(
                        () => _iocManager.IsRegistered(typeof(IGuidGenerator))
                            ? _iocManager.Resolve<IGuidGenerator>()
                            : SequentialGuidGenerator.Instance,
                        isThreadSafe: true
                        );

                _eventBus =
                    new Lazy<IEventBus>(
                        () => _iocManager.IsRegistered(typeof(IEventBus))
                            ? _iocManager.Resolve<IEventBus>()
                            : NullEventBus.Instance,
                        isThreadSafe: true
                    );
            }
            catch (Exception e)
            {
                Logger.Error(e.Message, e);
            }
        }

        public override bool OnSave(object entity, object id, object[] state, string[] propertyNames, IType[] types)
        {
            //Set Id for Guids
            if (entity is IEntity<Guid>)
            {
                var guidEntity = entity as IEntity<Guid>;
                if (guidEntity.IsTransient())
                {
                    guidEntity.Id = _guidGenerator.Value.Create();
                }
            }

            //Set CreationTime for new entity
            if (entity is IHasCreationTime)
            {
                for (var i = 0; i < propertyNames.Length; i++)
                {
                    if (propertyNames[i] == "CreationTime")
                    {
                        state[i] = (entity as IHasCreationTime).CreationTime = Clock.Now;
                    }
                }
            }

            //Set CreatorUserId for new entity
            if (entity is ICreationAudited && _abpSession.Value.UserId.HasValue)
            {
                for (var i = 0; i < propertyNames.Length; i++)
                {
                    if (propertyNames[i] == "CreatorUserId")
                    {
                        state[i] = (entity as ICreationAudited).CreatorUserId = _abpSession.Value.UserId;
                    }
                }
            }

            EntityChangeEventHelper.TriggerEntityCreatingEvent(entity);
            EntityChangeEventHelper.TriggerEntityCreatedEventOnUowCompleted(entity);

            TriggerDomainEvents(entity);
            EntityHistoryHelper?.AddEntityChange(entity);

            return base.OnSave(entity, id, state, propertyNames, types);
        }

        public override bool OnFlushDirty(object entity, object id, object[] currentState, object[] previousState, string[] propertyNames, IType[] types)
        {
            var updated = false;

            //Set modification audits
            if (entity is IHasModificationTime)
            {
                for (var i = 0; i < propertyNames.Length; i++)
                {
                    if (propertyNames[i] == "LastModificationTime")
                    {
                        currentState[i] = (entity as IHasModificationTime).LastModificationTime = Clock.Now;
                        updated = true;
                    }
                }
            }

            if (entity is IModificationAudited && _abpSession.Value.UserId.HasValue)
            {
                for (var i = 0; i < propertyNames.Length; i++)
                {
                    if (propertyNames[i] == "LastModifierUserId")
                    {
                        currentState[i] = (entity as IModificationAudited).LastModifierUserId = _abpSession.Value.UserId;
                        updated = true;
                    }
                }
            }

            if (entity is ISoftDelete && entity.As<ISoftDelete>().IsDeleted)
            {
                //Is deleted before? Normally, a deleted entity should not be updated later but I preferred to check it.
                var previousIsDeleted = false;
                for (var i = 0; i < propertyNames.Length; i++)
                {
                    if (propertyNames[i] == "IsDeleted")
                    {
                        previousIsDeleted = (bool)previousState[i];
                        break;
                    }
                }

                if (!previousIsDeleted)
                {
                    //set DeletionTime
                    if (entity is IHasDeletionTime)
                    {
                        for (var i = 0; i < propertyNames.Length; i++)
                        {
                            if (propertyNames[i] == "DeletionTime")
                            {
                                currentState[i] = (entity as IHasDeletionTime).DeletionTime = Clock.Now;
                                updated = true;
                            }
                        }
                    }

                    //set DeleterUserId
                    if (entity is IDeletionAudited && _abpSession.Value.UserId.HasValue)
                    {
                        for (var i = 0; i < propertyNames.Length; i++)
                        {
                            if (propertyNames[i] == "DeleterUserId")
                            {
                                currentState[i] = (entity as IDeletionAudited).DeleterUserId = _abpSession.Value.UserId;
                                updated = true;
                            }
                        }
                    }

                    EntityChangeEventHelper.TriggerEntityDeletingEvent(entity);
                    EntityChangeEventHelper.TriggerEntityDeletedEventOnUowCompleted(entity);
                }
                else
                {
                    EntityChangeEventHelper.TriggerEntityUpdatingEvent(entity);
                    EntityChangeEventHelper.TriggerEntityUpdatedEventOnUowCompleted(entity);
                }
            }
            else
            {
                EntityChangeEventHelper.TriggerEntityUpdatingEvent(entity);
                EntityChangeEventHelper.TriggerEntityUpdatedEventOnUowCompleted(entity);
            }

            TriggerDomainEvents(entity);

            EntityHistoryHelper?.AddEntityChange(entity);

            return base.OnFlushDirty(entity, id, currentState, previousState, propertyNames, types) || updated;
        }

        public override void OnDelete(object entity, object id, object[] state, string[] propertyNames, IType[] types)
        {
            EntityChangeEventHelper.TriggerEntityDeletingEvent(entity);
            EntityChangeEventHelper.TriggerEntityDeletedEventOnUowCompleted(entity);

            TriggerDomainEvents(entity);

            EntityHistoryHelper?.AddEntityChange(entity);

            base.OnDelete(entity, id, state, propertyNames, types);
        }

        public override void OnCollectionRecreate(object collection, object key)
        {
            try
            {
                if (collection is IPersistentCollection map)
                {
                    // find exact property by loop because map.Role is empty here
                    PropertyInfo? property = null;
                    var props = map.Owner.GetType().GetProperties();
                    foreach (var prop in props)
                    {
                        if (prop.GetValue(map.Owner) == collection)
                        {
                            property = prop;
                            break;
                        }
                    }
                    if (property != null)
                    {
                        EntityHistoryHelper?.AddAuditedAsManyToMany(map.Owner, property, null, collection);
                    }
                }
            }
            catch (HibernateException e)
            {
                Logger.Error(e.Message, e);
            }
            base.OnCollectionRecreate(collection, key);
        }

        public override void OnCollectionRemove(object collection, object key)
        {
            try
            {
                if (collection is IPersistentCollection map)
                {
                    var propertyName = map.Role.Split('.').Last();
                    var property = map.Owner.GetType().GetProperty(propertyName);
                    var newValue = property.GetValue(map.Owner, null);
                    EntityHistoryHelper?.AddAuditedAsManyToMany(map.Owner, property, collection, newValue);
                }
            }
            catch (HibernateException e)
            {
                Logger.Error(e.Message, e);
            }
            base.OnCollectionRemove(collection, key);
        }

        public override SqlString OnPrepareStatement(SqlString sql)
        {
            return base.OnPrepareStatement(sql);
        }

        public override void OnCollectionUpdate(object collection, object key)
        {
            try
            {
                if (collection is IPersistentCollection map)
                {
                    var propertyName = map.Role.Split('.').Last();
                    var property = map.Owner.GetType().GetProperty(propertyName);
                    var newValue = property.GetValue(map.Owner, null);
                    EntityHistoryHelper?.AddAuditedAsManyToMany(map.Owner, property, map.StoredSnapshot, newValue);

                    /* AS: Experiments for using one table for linking two entities with several list properties with the same entity types */
                    /*var (added, removed) = IEnumerableExtensions.GetListNewAndRemoved<object>(map.StoredSnapshot, newValue);
                    if (added.Any())
                    {
                        foreach (var item in added)
                        {
                            var parentId = map.Owner.GetType().GetProperty("Id").GetValue(map.Owner);
                            var childId = item.GetType().GetProperty("Id").GetValue(item);

                            var instance = Activator.CreateInstance("Boxfusion.SheshaFunctionalTests.Common.Application", "Boxfusion.SheshaFunctionalTests.Common.Application.Services.OrganisationTestDirectPersons")?
                                .Unwrap();
                            var objType = instance.GetType();
                            objType.GetProperty("OrganisationTestId").SetValue(instance, parentId);
                            objType.GetProperty("PersonId").SetValue(instance, childId);
                            objType.GetProperty("Test").SetValue(instance, propertyName);

                            Session.Save(instance);
                        }
                    }*/
                    /*foreach (var item in removed)
                    {
                        var childId = item.GetType().GetProperty("Id").GetValue(item);

                        var instance = Activator.CreateInstance("Boxfusion.SheshaFunctionalTests.Common.Application", "oxfusion.SheshaFunctionalTests.Common.Application.Services.OrganisationTestDirectPersons");
                        var objType = instance.GetType();
                        objType.GetProperty("OrganisationTestId").SetValue(instance, parentId);
                        objType.GetProperty("PersonId").SetValue(instance, childId);
                        objType.GetProperty("Test").SetValue(instance, propertyName);
                    }*/
                }
            }
            catch (HibernateException e)
            {
                Logger.Error(e.Message, e);
            }

            base.OnCollectionUpdate(collection, key);
        }

        public override void PostFlush(System.Collections.ICollection entities)
        {
            try
            {
                if (EntityHistoryHelper == null)
                    return;

                if (EntityHistoryHelper.EntityChanges.Any())
                {
                    EntityHistoryHelper.SaveAndClear();
                }
            }
            catch (HibernateException e)
            {
                Logger.Error(e.Message, e);
            }

            base.PostFlush(entities);
        }

        protected virtual void TriggerDomainEvents(object entityAsObj)
        {
            var generatesDomainEventsEntity = entityAsObj as IGeneratesDomainEvents;
            if (generatesDomainEventsEntity == null)
            {
                return;
            }

            if (generatesDomainEventsEntity.DomainEvents.IsNullOrEmpty())
            {
                return;
            }

            var domainEvents = generatesDomainEventsEntity.DomainEvents.ToList();
            generatesDomainEventsEntity.DomainEvents.Clear();

            foreach (var domainEvent in domainEvents)
            {
                _eventBus.Value.Trigger(domainEvent.GetType(), entityAsObj, domainEvent);
            }
        }

        public override bool OnLoad(object entity, object id, object[] state, string[] propertyNames, IType[] types)
        {
            if (entity.GetType().IsDefined(typeof(DisableDateTimeNormalizationAttribute), true))
            {
                return true;
            }

            NormalizeDateTimePropertiesForEntity(entity, state, propertyNames, types);
            return true;
        }

        private static void NormalizeDateTimePropertiesForEntity(object entity, object[] state, string[] propertyNames, IList<IType> types)
        {
            for (var i = 0; i < types.Count; i++)
            {
                var prop = entity.GetType().GetProperty(propertyNames[i]);
                if (prop != null && prop.IsDefined(typeof(DisableDateTimeNormalizationAttribute), true))
                {
                    continue;
                }

                if (types[i].IsComponentType)
                {
                    NormalizeDateTimePropertiesForComponentType(state[i], types[i]);
                }

                if (types[i].ReturnedClass != typeof(DateTime) && types[i].ReturnedClass != typeof(DateTime?))
                {
                    continue;
                }

                var dateTime = state[i] as DateTime?;

                if (!dateTime.HasValue)
                {
                    continue;
                }

                state[i] = Clock.Normalize(dateTime.Value);
            }
        }

        private static void NormalizeDateTimePropertiesForComponentType(object componentObject, IType type)
        {
            if (componentObject == null)
            {
                return;
            }

            var componentType = type as ComponentType;
            if (componentType == null)
            {
                return;
            }

            for (int i = 0; i < componentType.PropertyNames.Length; i++)
            {
                var propertyName = componentType.PropertyNames[i];
                if (componentType.Subtypes[i].IsComponentType)
                {
                    var prop = componentObject.GetType().GetProperty(propertyName);
                    if (prop == null)
                    {
                        continue;
                    }

                    if (prop.IsDefined(typeof(DisableDateTimeNormalizationAttribute), true))
                    {
                        continue;
                    }

                    var value = prop.GetValue(componentObject, null);
                    NormalizeDateTimePropertiesForComponentType(value, componentType.Subtypes[i]);
                }

                if (componentType.Subtypes[i].ReturnedClass != typeof(DateTime) && componentType.Subtypes[i].ReturnedClass != typeof(DateTime?))
                {
                    continue;
                }

                var subProp = componentObject.GetType().GetProperty(propertyName);
                if (subProp == null)
                {
                    continue;
                }

                if (subProp.IsDefined(typeof(DisableDateTimeNormalizationAttribute), true))
                {
                    continue;
                }

                var dateTime = subProp.GetValue(componentObject) as DateTime?;

                if (!dateTime.HasValue)
                {
                    continue;
                }

                subProp.SetValue(componentObject, Clock.Normalize(dateTime.Value));
            }
        }

        #region post transaction actions

        private Stack<Action> AfterTransactionActions { get; set; } = new Stack<Action>();

        /// <summary>
        /// Add action that should be executed after completion of the current transaction
        /// </summary>
        /// <param name="action"></param>
        public void AddAfterTransactionAction(Action action)
        {
            AfterTransactionActions.Push(action);
        }

        /// inheritedDoc
        public override void AfterTransactionCompletion(ITransaction tx)
        {
            if (tx != null && tx.WasCommitted) 
            {
                while (AfterTransactionActions.Any())
                {
                    var action = AfterTransactionActions.Pop();
                    action.Invoke();
                }
            }

            base.AfterTransactionCompletion(tx);
        }

        #endregion
    }
}
