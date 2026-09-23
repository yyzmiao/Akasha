/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    name: "sync_items",
    type: "base",
    fields: [
      {
        name: "entityType",
        type: "text",
        required: true,
        min: 1,
        max: 64
      },
      {
        name: "entityId",
        type: "text",
        required: true,
        min: 1,
        max: 128
      },
      {
        name: "payload",
        type: "json",
        required: false,
        maxSize: 5000000
      },
      {
        name: "clientUpdatedAt",
        type: "number",
        required: true
      },
      {
        name: "isDeleted",
        type: "bool",
        required: false
      },
      {
        name: "user",
        type: "relation",
        required: true,
        collectionId: "_pb_users_auth_",
        cascadeDelete: true,
        maxSelect: 1
      }
    ],
    indexes: [
      "CREATE UNIQUE INDEX `idx_sync_user_entity` ON `sync_items` (`user`, `entityType`, `entityId`)",
      "CREATE INDEX `idx_sync_user_updated` ON `sync_items` (`user`, `clientUpdatedAt`)"
    ],
    listRule: "@request.auth.id != '' && user = @request.auth.id",
    viewRule: "@request.auth.id != '' && user = @request.auth.id",
    createRule: "@request.auth.id != '' && user = @request.auth.id",
    updateRule: "@request.auth.id != '' && user = @request.auth.id",
    deleteRule: "@request.auth.id != '' && user = @request.auth.id"
  });

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("sync_items");
    if (collection) {
      return app.delete(collection);
    }
  } catch (_e) {}
});
