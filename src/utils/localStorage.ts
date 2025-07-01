export const setItemLocalStorage = (key: string, value: any, ttl? : number) => {
   const item = {
       value,
       expiry: ttl ? Date.now() + ttl : null
   };
   localStorage.setItem(key, JSON.stringify(item));
};

export const getItemLocalStorage = (key: string): any => {
   const item = localStorage.getItem(key);
   if (item) {
       const { value, expiry } = JSON.parse(item);
       if (!expiry || Date.now() < expiry) {
           return value;
       }
       localStorage.removeItem(key);
   }
   return null;
};

export const removeItemLocalStorage = (key: string): void => {
   localStorage.removeItem(key);
};