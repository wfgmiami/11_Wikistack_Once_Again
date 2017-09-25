const Sequelize = require('sequelize');
const marked = require('marked');

const db = new Sequelize('postgres://localhost/wikistackdb', { logging: false });

const Page = db.define('page', {
  title: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  urlTitle: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  content: {
    type: db.Sequelize.TEXT,
    allowNull: false
  },
  status: {
    type: Sequelize.ENUM('open', 'closed')
  },
  date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  tags: {
    type: Sequelize.ARRAY(Sequelize.STRING),
    set: function(value){
      let arrayOfTags;

      if(typeof value === 'string'){
        arrayOfTags = value.split(',').map( tag => tag.trim() )
        this.setDataValue('tags', arrayOfTags)
      }else{
        this.setDataValue('tags', value)
      }
    }
  }
},{
    getterMethods: {
      route: function(){
        return '/wiki/' + this.urlTitle;
      },
      renderedContent: function(){
        return marked(this.content);
      }
    },
    hooks:{
      beforeValidate: function(Page) {
        if(Page.title) Page.urlTitle = Page.title.replace(/\s+/g, "_").replace(/\W/g,"");
        else Page.urlTitle = Math.random.toString(36).substring(2,7);
      }
    },
    instanceMethods: {
      getPage: function(urlTitle){
        return Page.findOne( {
          where: {
            urlTitle: urlTitle
          }
        })
      },
      findSimilar: function(){

        return Page.findAll({
          where: {
            tags: {
              $overlap: this.tags
            },
            id: { $ne: this.id }
          }
        })
      }
    },
    classMethods: {
      getAllPages: function(){
        return Page.findAll()
      },
      findByTag:function(searchTags){
        searchTags = searchTags.split(',').map( tag => tag.trim())

        return Page.findAll({
          where: {
            tags: {
              $overlap: searchTags
            }
          }
        })
      }
    }
  }
)

const User = db.define('user', {
  name: {
    type: db.Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: db.Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  }
},{
  classMethods:{
    getAllUsers: function(){
      return User.findAll();
    }
  }
}
)

Page.belongsTo( User, { as: 'author' });
User.hasMany( Page );

module.exports = {
  Page,
  User,
  db
}

