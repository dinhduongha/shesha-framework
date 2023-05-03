import axios, { AxiosResponse } from "axios";
import { useMetadataDispatcher, useSheshaApplication } from "providers";
import { GENERIC_ENTITIES_ENDPOINT } from "shesha-constants";
import { IResult } from "interfaces/result";
import { IHttpHeadersDictionary } from "providers/sheshaApplication/contexts";
import qs from "qs";
import React, { ComponentType, useMemo } from "react";
import { FC } from "react";
import { camelcaseDotNotation } from "utils/string";
import { DataTableColumnDto, IExcelColumn, IExportExcelPayload, IGetDataFromBackendPayload, IGetListDataPayload, ITableDataColumn, ITableDataInternalResponse, ITableDataResponse } from "../interfaces";
import { IRepository, IHasRepository } from "./interfaces";
import { convertDotNotationPropertiesToGraphQL } from "providers/form/utils";
import { IConfigurableColumnsProps, IDataColumnsProps } from "providers/datatableColumnsConfigurator/models";
import { IMetadataDispatcherActionsContext } from "providers/metadataDispatcher/contexts";
import { IEntityEndpointsEvaluator, useModelApiHelper } from "components/configurableForm/useActionEndpoint";
import { StandardEntityActions } from "interfaces/metadata";
import { IUseMutateResponse, useMutate } from "hooks/useMutate";
import { IErrorInfo } from "interfaces/errorInfo";
import { IAjaxResponseBase } from "interfaces/ajaxResponse";
import FileSaver from "file-saver";

export interface IWithBackendRepositoryArgs {
    entityType: string;
    getListUrl: string;
}

export interface IBackendRepository extends IRepository {
    entityType: string;
}

interface ICreateBackendRepositoryArgs extends IWithBackendRepositoryArgs {
    backendUrl: string;
    httpHeaders: IHttpHeadersDictionary;
    metadataDispatcher: IMetadataDispatcherActionsContext;
    apiHelper: IEntityEndpointsEvaluator;
    mutator: IUseMutateResponse<any>;
}

const createRepository = (args: ICreateBackendRepositoryArgs): IBackendRepository => {
    const { backendUrl, httpHeaders, getListUrl, entityType, metadataDispatcher, apiHelper, mutator } = args;

    const getPropertyNamesForFetching = (columns: ITableDataColumn[]): string[] => {
        const result: string[] = [];
        columns.forEach(column => {
            result.push(column.propertyName);

            // special handling for entity references: expand properties list to include `id` and `_displayName`
            if (column.dataType === 'entity') {
                const requiredProps = [`${column.propertyName}.Id`, `${column.propertyName}._displayName`];
                requiredProps.forEach(rp => {
                    if (!result.includes(rp))
                        result.push(rp);
                });
            };
        });
        return result;
    };

    /** Convert common payload to a form that uses the back-end */
    const convertPayload = (payload: IGetListDataPayload): IGetDataFromBackendPayload => {
        const properties = getPropertyNamesForFetching(payload.columns);

        const result: IGetDataFromBackendPayload = {
            entityType: entityType,
            maxResultCount: payload.pageSize,
            skipCount: (payload.currentPage - 1) * payload.pageSize,
            properties: convertDotNotationPropertiesToGraphQL(properties),
            quickSearch: payload.quickSearch,
            sorting: payload.sorting
                .filter(s => Boolean(s.id))
                .map(s => camelcaseDotNotation(s.id) + (s.desc ? ' desc' : ''))
                .join(','),
            filter: payload.filter,
        };

        return result;
    };

    /** Convert back-end response to a form that is used by the data source */
    const convertListDataResponse = (
        response: IResult<ITableDataResponse>,
        pageSize: number
    ): ITableDataInternalResponse => {
        if (!response.result)
            throw 'Failed to parse response';

        const items = response.result.items ?? (Array.isArray(response.result) ? response.result : null);
        const totalCount = response.result.totalCount ?? items?.length;

        const internalResult: ITableDataInternalResponse = {
            totalRows: totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
            rows: items,
            totalRowsBeforeFilter: 0,
        };

        return internalResult;
    };

    const fetch = (payload: IGetListDataPayload): Promise<ITableDataInternalResponse> => {
        const getDataPayload = convertPayload(payload);

        const getDataUrl = `${backendUrl}${getListUrl || `${GENERIC_ENTITIES_ENDPOINT}/GetAll`}?${qs.stringify(
            getDataPayload
        )}`;

        return axios({
            url: getDataUrl,
            method: 'GET',
            headers: httpHeaders,
        }).then(response => {
            const dataResponse = response.data as IResult<ITableDataResponse>;
            return convertListDataResponse(dataResponse, payload.pageSize);
        });
    };

    const getPropertyNames = (columns: IConfigurableColumnsProps[]): string[] => {
        const result: string[] = [];
        columns.forEach(col => {
            const dataCol = col.columnType === 'data'
                ? col as IDataColumnsProps
                : null;
            if (dataCol && dataCol.propertyName)
                result.push(dataCol.propertyName);
        });
        return result;
    };

    const prepareColumns = (configurableColumns: IConfigurableColumnsProps[]): Promise<DataTableColumnDto[]> => {
        if (!entityType)
            return Promise.resolve([]);

        const dataProperties = getPropertyNames(configurableColumns ?? []);
        if (dataProperties.length === 0)
            return Promise.resolve([]);

        // fetch columns config from server
        return metadataDispatcher.getPropertiesMetadata({ modelType: entityType, properties: dataProperties })
            .then(response => {

                return dataProperties.map<DataTableColumnDto>(p => {

                    const baseProps = {
                        propertyName: p,
                        name: p,
                    };
                    const propMeta = response[p];
                    return propMeta
                        ? {
                            ...baseProps,
                            caption: propMeta.label,
                            description: propMeta.description,
                            dataType: propMeta.dataType,
                            dataFormat: propMeta.dataFormat,
                            referenceListName: propMeta.referenceListName,
                            referenceListModule: propMeta.referenceListModule,
                            entityReferenceTypeShortAlias: propMeta.entityType,
                            allowInherited: false, // todo: add to metadata
                            isFilterable: true, // todo: add to metadata
                            isSortable: true, // todo: add to metadata
                        }
                        : baseProps;
                });
            }).catch(e => {
                // todo: return error and handle on the upper level
                console.error('Failed to fetch table columns', e);
                return [];
            });
    };

    const convertError = (error: any): IErrorInfo => {
        const axiosResponse = error as AxiosResponse;
        const ajaxResponse = axiosResponse?.data as IAjaxResponseBase;

        return ajaxResponse?.error ?? error;
    };

    const performUpdate = (_rowIndex: number, data: any): Promise<any> => {
        // todo: add support of custom endpoint
        return apiHelper.getDefaultActionUrl({ modelType: entityType, actionName: StandardEntityActions.update }).then(endpoint => {
            return mutator.mutate(endpoint, data).then(response => {
                return response;
            }).catch(error => {
                throw convertError(error);
            });
        });
    };

    const performDelete = (_rowIndex: number, data: any): Promise<any> => {
        const id = data['id'];
        if (!id)
            return Promise.reject('Failed to determine `Id` of the object');

        return apiHelper.getDefaultActionUrl({ modelType: entityType, actionName: StandardEntityActions.delete }).then(endpoint => {
            const useQueryString = endpoint.httpVerb?.toUpperCase() === 'DELETE';

            const url = useQueryString
                ? `${endpoint.url}?${qs.stringify({ id })}`
                : endpoint.url;
            const data = useQueryString
                ? undefined
                : { id };

            return mutator.mutate({ ...endpoint, url }, data).then(response => {
                return response;
            }).catch(error => {
                throw convertError(error);
            });
        });
    };

    const performCreate = (_rowIndex: number, data: any): Promise<any> => {
        return apiHelper.getDefaultActionUrl({ modelType: entityType, actionName: StandardEntityActions.create }).then(endpoint => {
            return mutator.mutate(endpoint, data).then(response => {
                return response;
            }).catch(error => {
                throw convertError(error);
            });
        });
    };

    const exportToExcel = (payload: IGetListDataPayload): Promise<void> => {
        let excelColumns = payload.columns
            .map<IExcelColumn>(c => ({ propertyName: c.propertyName, label: c.caption }));

        if (excelColumns.findIndex(c => c.propertyName === 'id') === -1) {
            excelColumns = [{ propertyName: 'id', label: 'Id' }, ...excelColumns];
        }

        const getDataPayload = convertPayload(payload);

        const excelPayload: IExportExcelPayload = {
            ...getDataPayload,
            maxResultCount: 2147483647,
            columns: excelColumns,
        };
        
        const excelEndpoint = `${GENERIC_ENTITIES_ENDPOINT}/ExportToExcel`;
        const excelDataUrl = `${backendUrl}${excelEndpoint}`;

        return axios({
            url: excelDataUrl,
            method: 'POST',
            data: excelPayload,
            responseType: 'blob', // important
            headers: httpHeaders,
        })
            .then(response => {
                FileSaver.saveAs(new Blob([response.data]), 'Export.xlsx');
            });
    };

    const repository: IBackendRepository = {
        entityType: args.entityType,
        fetch,
        exportToExcel,
        prepareColumns,
        performCreate,
        performUpdate,
        performDelete,
    };
    return repository;
};

export const useBackendRepository = (args: IWithBackendRepositoryArgs): IBackendRepository => {
    const { backendUrl, httpHeaders } = useSheshaApplication();
    const metadataDispatcher = useMetadataDispatcher();
    const apiHelper = useModelApiHelper();
    const mutator = useMutate();

    const repository = useMemo<IBackendRepository>(() => {
        return createRepository({
            ...args,
            backendUrl,
            httpHeaders,
            metadataDispatcher,
            apiHelper,
            mutator,
        });
    }, [args.entityType, backendUrl, httpHeaders]);

    return repository;
};

export function withBackendRepository<WrappedProps>(WrappedComponent: ComponentType<WrappedProps & IHasRepository>, args: IWithBackendRepositoryArgs): FC<WrappedProps> {
    return props => {
        const repository = useBackendRepository(args);
        return (<WrappedComponent {...props} repository={repository} />);
    };
};