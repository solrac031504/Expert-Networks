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

// Super Many-to-Many Relationship
// That is, combining Many-to-Many with two One-to-Many definititions
// https://sequelize.org/docs/v6/advanced-association-concepts/advanced-many-to-many/

// Many to Many
Author.belongsToMany(Topic, { through: AuthorTopic, foreignKey: 'author_id', otherKey: 'topic_id' });
Topic.belongsToMany(Author, { through: AuthorTopic, foreignKey: 'topic_id', otherKey: 'author_id' });

// One to Many
Author.hasMany(AuthorTopic, { foreignKey: 'author_id' });
AuthorTopic.belongsTo(Author, { foreignKey: 'author_id' });

// One to Many again
Topic.hasMany(AuthorTopic, { foreignKey: 'topic_id' });
AuthorTopic.belongsTo(Topic, { foreignKey: 'topic_id' });

module.exports = AuthorTopic;
