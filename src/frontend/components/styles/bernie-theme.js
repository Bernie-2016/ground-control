import {Styles, Utils} from 'material-ui';
import {BernieColors, BernieText} from './bernie-css';

export const BernieTheme = {
  spacing: Styles.Spacing,
  fontFamily: BernieText.default.fontFamily,

  palette: {
    primary1Color: BernieColors.blue,
    primary2Color: BernieColors.red,
    primary3Color: Styles.Colors.grey400,
    accent1Color: BernieColors.red,
    accent2Color: BernieColors.lightGray,
    accent3Color: Styles.Colors.grey500,
    textColor: BernieText.default.color,
    alternateTextColor: Styles.Colors.white,
    canvasColor: Styles.Colors.white,
    borderColor: BernieColors.lightGray,
    disabledColor: Utils.ColorManipulator.fade(Styles.Colors.darkBlack, 0.3),
  },
};