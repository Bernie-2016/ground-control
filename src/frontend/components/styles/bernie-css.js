import {Styles} from 'material-ui';

export const BernieColors = {
  blue: 'rgb(20, 127, 215)',
  lightBlue: 'rgb(196, 223, 245)',
  red: 'rgb(245, 91, 91)',
  darkRed: 'rgb(237, 60, 57)',
  green: 'rgb(74, 204, 102)',
  darkGray: 'rgb(54, 67, 80)',
  gray: 'rgb(153, 155, 158)',
  lightGray: 'rgb(239, 243, 247)',
  white: Styles.Colors.white
}

export const BernieText = {
  default: {
    color: BernieColors.darkGray,
    fontFamily: 'freight-sans-pro',
    fontSize: '1.2em',
    fontWeight: 'normal',
    lineHeight: '1.5'
  },

  title: {
    color: BernieColors.blue,
    fontFamily: 'jubilat',
    fontSize: '2.6em',
    fontWeight: 'normal',
    lineHeight: 1,
    marginBottom: '0.5em'
  },

  secondaryTitle: {
    color: BernieColors.red,
    fontFamily: 'freight-sans-pro',
    textTransform: 'uppercase',
    fontSize: '1.6rem',
    fontWeight: 500,
    lineHeight: '1.5',
    letterSpacing: '0.1em',
    marginBottom: '0.25rem'
  },

  inputLabel: {
    colors: BernieColors.darkGray,
    fontFamily: 'freight-sans-pro',
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: '0.95em',
    letterSpacing: '0.1em',
  }
}

export const BernieLayout = {
  admin: {
    sideBarContentView: {
      paddingLeft: 25,
      paddingRight: 25,
      paddingTop: 25,
      paddingBottom: 25
    }
  }
}