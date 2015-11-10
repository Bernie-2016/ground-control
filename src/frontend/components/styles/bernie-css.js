import {Styles} from 'material-ui';

export const BernieColors = {
  blue: 'rgb(20, 127, 215)',
  lightBlue: 'rgb(196, 223, 245)',
  red: 'rgb(245, 91, 91)',
  darkRed: 'rgb(237, 60, 57)',
  green: 'rgb(74, 204, 102)',
  darkGray: 'rgb(54, 67, 80)',
  lightGray: 'rgb(239, 243, 247)',
}

// These should only include display styles, not anything layout related such as padding, block display, margin, etc.
export const BernieTextStyles = {
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
    lineHeight: 1
  },

  secondaryTitle: {
    color: BernieColors.red,
    fontFamily: 'freight-sans-pro',
    textTransform: 'uppercase',
    fontSize: '1.6rem',
    fontWeight: 500,
    lineHeight: '1.5',
    letterSpacing: '0.1em',
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