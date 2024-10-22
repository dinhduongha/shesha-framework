import { IConfigurableFormComponent } from '@/providers/form/models';
import { IconType } from '@/components';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { CSSProperties } from 'styled-components';
import { IStyleType } from '../_settings/components/styleGroup/models';

export type TextType = 'text' | 'password';

export interface IInputStyles {
  size?: SizeType;
  borderSize?: string | number;
  borderRadius?: number;
  borderType?: string;
  borderColor?: string;
  fontColor?: string;
  fontWeight?: string | number;
  fontSize?: string | number;
  stylingBox?: string;
  height?: string | number;
  width?: string | number;
  backgroundColor?: string;
  hideBorder?: boolean;
  styles?: IStyleType;
  style?: string | CSSProperties;
}
export interface ITextFieldComponentProps extends IConfigurableFormComponent {
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  suffixIcon?: IconType;
  prefixIcon?: IconType;
  initialValue?: string;
  textType?: TextType;
  styles?: IStyleType;
  width?: string;
  height?: string;
  hideBorder?: boolean;
  borderSize?: number;
  borderRadius?: number;
  borderColor?: string;
  fontSize?: string;
  fontColor?: string;
  backgroundColor?: string;
  stylingBox?: string;
  desktop?: IInputStyles | IStyleType;
  mobile?: IInputStyles | IStyleType;
  tablet?: IInputStyles | IStyleType;
}
