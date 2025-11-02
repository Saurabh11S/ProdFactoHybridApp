interface ApiObject {
    [key: string]: any;
  }
  
  export function defineCancelApiObject(apiObject: ApiObject) {
    const cancelApiObject: {
      [key: string]: { handleRequestCancellation: () => AbortController };
    } = {};
  
    Object.keys(apiObject).forEach((apiPropertyName) => {
      const cancellationControllerObject = {
        controller: undefined as AbortController | undefined,
      };
  
      cancelApiObject[apiPropertyName] = {
        handleRequestCancellation: () => {
          cancellationControllerObject.controller?.abort();
          cancellationControllerObject.controller = new AbortController();
          return cancellationControllerObject.controller;
        },
      };
    });
  
    return cancelApiObject;
  }
  