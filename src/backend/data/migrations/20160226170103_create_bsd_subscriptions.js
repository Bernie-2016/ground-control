
exports.up = async function(knex, Promise) {

   if (process.env.NODE_ENV === 'production'){
        return null;
    }

    await knex.schema.createTableIfNotExists('bsd_subscriptions', function(table){
      table.bigInteger('cons_email_chapter_subscription_id');
      table.bigInteger('cons_email_id').index('bsd_subscriptions_cons_email_id_index', 'btree');
      table.bigInteger('cons_id').index('bsd_subscriptions_cons_id_index', 'btree');
      table.bigInteger('chapter_id');
      table.boolean('isunsub').index('bsd_subscriptions_isunsub_index', 'btree');
      table.timestamp('unsub_dt', true);
      table.timestamp('modified_dt', true);
    });

};

exports.down = function(knex, Promise) {

};