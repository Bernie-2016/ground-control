import {BernieColors, BernieText} from './bernie-css'
import {colors as MaterialColors} from 'material-ui/styles'
import ColorManipulator from 'material-ui/utils/colorManipulator'
console.log(ColorManipulator)

export const BernieTheme = {
  // spacing: bernieMuiTheme.Spacing,
  fontFamily: BernieText.default.fontFamily,

  palette: {
    primary1Color: BernieColors.blue,
    primary2Color: BernieColors.red,
    primary3Color: MaterialColors.grey400,
    accent1Color: BernieColors.red,
    accent2Color: BernieColors.lightGray,
    accent3Color: MaterialColors.grey500,
    textColor: BernieText.default.color,
    alternateTextColor: MaterialColors.white,
    canvasColor: MaterialColors.white,
    borderColor: BernieColors.lightGray,
    // disabledColor: ColorManipulator.fade(MaterialColors.darkBlack, 0.3),
  },
};