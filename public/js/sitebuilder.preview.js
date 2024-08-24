console.log('iframe page initialized')
window.parent.postMessage({type: 'hydrate'}, "*");