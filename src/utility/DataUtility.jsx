class DataUtility {
    constructor() {
        this._data = null;
        this._map = {
            v1: null
        };
    }

    getKeyByValue(object, value) {
        for(let prop in object) {
            if(object.hasOwnProperty(prop)) {
                if(object[prop] === value) {
                    return prop;
                }
            }
        }

        return "0";
    }

    getJSON(url) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();

            request.open("GET", url, true);

            request.onload = () => {
                if(request.status >= 200 && request.status < 400) {
                    try {
                        const json = JSON.parse(request.responseText);
                        resolve(json);
                    } catch(ex) {
                        reject(ex);
                    }
                }
            };

            request.onerror = () => {
                reject();
            };

            request.send();
        });
    }

    loadData() {
        if(this.isCurrentDataStillValid()) {
            this._data = this.retrieveData("__db_data");
            this._map.v1 = this.retrieveData("__db_map_v1");

            return Promise.resolve(true);
        }

        return Promise.all([
            this.getJSON("/dist/data.json"),
            this.getJSON("/.map/v1.json")
        ]).then(([data, mapV1]) => {
            this.persistData("__db_lastupdate", new Date().getTime());
            this.persistData("__db_data", data);
            this.persistData("__db_map_v1", mapV1);

            this._data = data;
            this._map.v1 = mapV1;

            return true;
        }).catch(reason => {
            console.error(reason);
            return false;
        });
    }

    isCurrentDataStillValid() {
        const lastUpdate = this.retrieveData("__db_lastupdate");

        if(!lastUpdate) {
            return false;
        }

        const now = new Date().getTime();

        const SECOND = 1000;
        const MINUTE = 60 * SECOND;

        return now < (lastUpdate + 30 * MINUTE);
    }

    persistData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    retrieveData(key) {
        return JSON.parse(localStorage.getItem(key));
    }

    data() {
        return this._data;
    }

    stringMap(version = 1) {
        switch(version) {
            case 1: return this._map.v1;
        }

        return null;
    }
}

export default new DataUtility();