import React from 'react';

export default class AdminHelpers {
  static contentViewFromId(id, creationForm, itemView) {
    let contentView = <div></div>;
    if (id === 'create')
      contentView = creationForm
    else if (id)
      contentView = itemView
    return contentView;
  }

  static variablesFromId(id) {
    if (id && id !== 'create')
      return {
        id: id,
        fetchItem: true
      }
    else
      return {
        id: '',
        fetchItem: false
      }
  }
}