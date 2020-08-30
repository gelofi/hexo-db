const superagent = require("superagent");
const Util = require('./Util');

/**
 * HexoDB -
 * Your own database, maintained on Glitch or Repl.it
 * Created by Fizuku | Fizx | FizxCreations.
 */

class Database {
    
    /**
     * Creates HexoDB instance
     * @param {string} HexoShard Repl.it project domain
     * @example const Hexo = require("hexo-db");
     * const db = new Hexo.Database("https://hexodb.glitch.me/");
     */
     constructor(shardURL){
       this.database = shardURL;
     }

    /**
     * Sets a value to the specified key on the database
     * @param {string} key Key
     * @param value Data
     * @example db.set("foo", "bar").then(() => console.log("Saved data"));
    */
     async set(key, value){
      if (!Util.isKey(key)) throw new Error("Invalid key provided!", "KeyError");
      if (!Util.isValue(value)) throw new Error("Invalid value provided!", "ValueError");
      if(typeof value == "number") value = (value).toString()
      let { body } = await superagent.get(this.database + "/set?" + key + "=" + value);
      if(!{ body }) throw new Error("The HexoShard URL is invalid! No data was found.", "HexoError");

      return body.operation
    }

        /**
     * Sets a value to the specified key on the database
     * @param {string} key Key
     * @param value Data
     * @example db.set("foo", "bar").then(() => console.log("Saved data"));
    */
    async write(key, value){
      return this.set(key, value);
    }

    /**
     * Deletes a data from the database
     * @param {string} key Key
     * @example db.delete("foo").then(() => console.log("Deleted data"));
    */
    async delete(key){
      if (!Util.isKey(key)) throw new Error("Invalid key provided!", "KeyError");

      let { body } = await superagent.get(this.database + "/delete?" + key);
      if(!{ body }) throw new Error("The HexoShard URL is invalid! No data was found.", "KeyError");

      return body.operation
    }

    /**
     * Fetches the data from database
     * @param {string} key Key
     * @example db.fetch("foo").then(console.log);
     */
    async fetch(key){
    let { body } = await superagent.get(this.database + "/fetch?" + key)
    if(!{ body }) throw new Error("The HexoShard URL is invalid! No data was found.", "KeyError")
    return body.data;
    }

    /**
     * Fetches the data from database
     * @param {string} key Key
     * @example db.get("foo").then(console.log);
    */
    async get(key){
      return this.fetch(key)
    }

    /**
     * Checks if there is a data stored with the given key
     * @param {string} key Key
     * @example db.exists("foo").then(console.log);
    */
    async exists(key) {
      if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
      let get = await this.get(key);
      return !!get;
    }

    /**
     * Checks if there is a data stored with the given key
     * @param {string} key Key
     * @example db.has("foo").then(console.log);
    */
    async has(key) {
      return await this.exists(key);
    }

    /**
     * Returns everything from the database
     * @returns {Promise <Array>}
     * @example let data = await db.all();
     * console.log(`There are total ${data.length} entries.`);
    */
    async all(){
        let { body } = await superagent.get(this.database + "/fetchall");
        return body;
    }

     /**
     * A math calculation
     * @param {string} key Data key
     * @param {string} operator One of +, -, * or /
     * @param {number} value The value, must be a number
     * @example db.math("items", "+", 200).then(() => console.log("Added 200 items"));
     */
    async math(key, operator, value) {
      if (!Util.isKey(key)) throw new Error("Invalid key specified!", "KeyError");
      if (!operator) throw new Error("No operator provided!");
      if (!Util.isValue(value)) throw new Error("Invalid value specified!", "ValueError");

      switch(operator) {
          case "add":
          case "+":
              let add = await superagent.get(this.database + "/fetch?" + key);
              if (!add) {
                  return this.set(key, value);
              } else {
                  if (typeof add.data !== "number") throw new Error("Target is not a number!");
                  return this.set(key, add.data + value);
              }
              break;

          case "subtract":
          case "sub":
          case "-":
              let less = await superagent.get(this.database + "/fetch?" + key);
              if (!less) {
                  return this.set(key, value);
              } else {
                  if (typeof less.data !== "number") throw new Error("Target is not a number!");
                  return this.set(key, less.data - value);
              }
              break;

          case "multiply":
          case "mul":
          case "*":
              let mul = await superagent.get(this.database + "/fetch?" + key);
              if (!mul) {
                  return this.set(key, value);
              } else {
                  if (typeof mul.data !== "number") throw new Error("Target is not a number!");
                  return this.set(key, mul.data * value);
              }
              break;

          case "divide":
          case "div":
          case "/":
              let div = await superagent.get(this.database + "/fetch?" + key);
              if (!div) {
                  return this.set(key, value);
              } else {
                  if (typeof div.data !== "number") throw new Error("Target is not a number!");
                  return this.set(key, div.data / value);
              }
              break;
          default:
              throw new Error("Unknown operator provided!");
        }
    }

        /**
     * Add to a number value
     * @param {string} key key
     * @param {number} value value
     * @example db.add("items", 200).then(() => console.log("Added 200 items"));
     */
    async add(key, value) {
      return await this.math(key, "+", value);
  }

  /**
   * Subtract to a number value
   * @param {string} key Key
   * @param {number} value Value     
   * @example db.subtract("items", 100).then(() => console.log("Removed 100 items"));
   */
     async subtract(key, value) {
        return await this.math(key, "-", value);
     }

    /**
     * Fetches everything and sorts by given target
     * @param {string} key Key
     * @param {object} ops Options
     * @example const data = await db.startsWith("money", { sort: ".data" });
    */
    async startsWith(key, ops) {
      if (!key || typeof key !== "string") throw new Error(`Expected key to be a string, but received a ${typeof key}`);
      let all = await this.all();
      return Util.sort(key, all, ops);
    }

    /**
     * Fetches the overall ping of your database shard, in MS
     * @example const ping = await db.ping();
     * console.log("Ping: ", ping);
    */
    async ping(){
      let { body } = await superagent.get(this.database + "/latency");
      let ping = Date.now() - parseInt(body.ping)
      return ping; 
    }

}

module.exports = Database;
