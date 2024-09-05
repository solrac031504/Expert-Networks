const { DataTypes } = require('sequelize');
const sequelize = require ('../database');
const Author = require('./Author');
const Topic = require('./Topic')

const AuthorTopic = sequelize.define('AuthorTopic', {
    author_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        references: {
            model: Author,
            key: 'id',
        },
        primaryKey: true,
    },
    topic_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Topic,
            key: 'id',
        },
        primaryKey: true,
    }
}, { timestamps: false });

// Many-to-Many Relationship
Author.belongsToMany(Topic, { through: AuthorTopic, foreignKey: 'author_id', otherKey: 'topic_id' });
Topic.belongsToMany(Author, { through: AuthorTopic, foreignKey: 'topic_id', otherKey: 'author_id' });

module.exports = AuthorTopic;
