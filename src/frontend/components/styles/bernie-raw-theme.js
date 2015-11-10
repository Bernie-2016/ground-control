import {Styles, Utils} from 'material-ui';
import {BernieColors, BernieTextStyles} from './bernie-css';

module.exports = {
  spacing: Styles.Spacing,
  fontFamily: BernieTextStyles.default.fontFamily,

  palette: {
    primary1Color: BernieColors.lightBlue,
    primary2Color: BernieColors.blue,
    primary3Color: Styles.Colors.grey400,
    accent1Color: BernieColors.red,
    accent2Color: BernieColors.lightGray,
    accent3Color: Styles.Colors.grey500,
    textColor: BernieTextStyles.default,color,
    alternateTextColor: Styles.Colors.white,
    canvasColor: Styles.Colors.white,
    borderColor: BernieColors.lightGray,
    disabledColor: Utils.ColorManipulator.fade(Styles.Colors.darkBlack, 0.3),
  },
};