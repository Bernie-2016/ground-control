export default function(sequelize, DataTypes) {
  let BSDAddress = sequelize.define('BSDAddress', {
    id: {
      type: DataTypes.BIGINT,
      field: 'cons_addr_id',
      primaryKey: true
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      field: 'is_primary'
    },
    line1: {
      type: DataTypes.STRING(300),
      allowNull: true,
      field: 'addr1'
    },
    line2: {
      type: DataTypes.STRING(300),
      allowNull: true,
      field: 'addr2'
    },
    line3: {
      type: DataTypes.STRING(300),
      allowNull: true,
      field: 'addr3'
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'state_cd'
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: true
    },
    zip4: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'zip_4'
    },
    country: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    latitude: DataTypes.DOUBLE,
    longitude: DataTypes.DOUBLE
  }, {
    updatedAt: 'modified_dt',
    createdAt: 'create_dt',
    underscored: true,
    tableName: 'bsd_cons_addr',
    classMethods: {
      associate: (models) => {
        BSDAddress.belongsTo(models.ZipCode, { foreignKey: 'zip', as: 'zipInfo' })
      }
    }
  })
  return BSDAddress;
}