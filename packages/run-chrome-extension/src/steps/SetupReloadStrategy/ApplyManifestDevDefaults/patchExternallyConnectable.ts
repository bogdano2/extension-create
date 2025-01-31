export default function patchExternallyConnectable(manifest: any) {
  // From https://developer.chrome.com/docs/extensions/reference/manifest/externally-connectable
  // If the externally_connectable key is not declared in your extension's
  // manifest, all extensions can connect, but no web pages can connect.
  // As a consequence, when updating your manifest to use externally_connectable,
  // if "ids": ["*"] is not specified, then other extensions will lose the ability
  // to connect to your extension. This may be an unintended consequence, so keep it in mind.

  if (!manifest.externally_connectable) {
    return {
      externally_connectable: {
        ...manifest.externally_connectable,
        ids: ['*']
      }
    }
  }

  if (!manifest.externally_connectable.ids) {
    return {
      externally_connectable: {
        ...manifest.externally_connectable,
        ids: ['*']
      }
    }
  }

  return {
    externally_connectable: {
      ...manifest.externally_connectable
    }
  }
}
