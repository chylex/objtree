(function(){
  const OBJTREE_OBJECT = 0;
  const OBJTREE_UNKNOWN = 1;
  const OBJTREE_COMPLEX_FUNCTION = 2;
  const OBJTREE_SIMPLE_FUNCTION = 3;
  const OBJTREE_PRIMARRAY = 4;
  const OBJTREE_VARIABLE = 5;
  const OBJTREE_TOODEEP = 6;
  
  const OBJTREE_NAMES = [
    "[obj]", "[???]", "[fun]", "[fun]", "[arr]", "[var]", "[!!!]"
  ];
  
  var objtree = function(target, {
    maxlevel = 10,
    grandparent = "",
    indentstr = "  ",
    exclude = []
  } = {}){
    var excludeRules = exclude.map(rule => new RegExp(rule));
    
    var getObjectDesc = function(obj){
      switch(typeof obj){
        case "object":
          if (obj === null){
            return [ OBJTREE_VARIABLE, "(null)" ];
          }
          else if (Array.isArray(obj)){
            if (obj.length === 0){
              return [ OBJTREE_PRIMARRAY, "[]" ];
            }
            else if (obj.every(ele => {
              let type = typeof ele;
              return type === "boolean" || type === "number" || (type === "string" && ele.indexOf('\n') === -1);
            })){
              return [ OBJTREE_PRIMARRAY, "[ "+obj.join(", ")+" ]" ];
            }
          }
          
          return [ OBJTREE_OBJECT ]; // special handling
  
        case "function":
          if (Object.keys(obj).length === 0 && (!obj.prototype || Object.keys(obj.prototype).length === 0)){
            return [ OBJTREE_SIMPLE_FUNCTION, obj.toString().match(/\((.*?)\)/)[0] ];
          }
          else{
            return [ OBJTREE_COMPLEX_FUNCTION, obj.toString().match(/\((.*?)\)/)[0] ];
          }
  
        case "boolean":
        case "number":
        case "string":
          return [ OBJTREE_VARIABLE, obj ];
  
        case "undefined":
          return [ OBJTREE_VARIABLE, "(undefined)" ];
  
        default:
          return [ OBJTREE_UNKNOWN, obj.toString() ];
      }
    };
    
    var generateTree = function(node, parents, level){
      let res = {};
      
      for(let key in node){
        if (excludeRules.length){
          let fullKey = parents+key;
          
          if (excludeRules.some(rule => rule.test(fullKey))){
            res[key] = {
              type: OBJTREE_UNKNOWN,
              value: "(excluded)"
            };
            
            continue;
          }
        }
        
        let obj = node[key];
        let [ type, value ] = getObjectDesc(obj);
        
        if (type === OBJTREE_OBJECT){
          if (level > maxlevel){
            type = OBJTREE_TOODEEP;
            value = "(too deep)";
          }
          else{
            value = generateTree(obj, parents+key+"/", level+1);
          }
        }
        else if (type === OBJTREE_COMPLEX_FUNCTION){
          let data = { __args: value };
          
          for(let fkey in obj){
            data[fkey] = obj[fkey];
          }
          
          if (obj.prototype){
            data.prototype = {};
            
            for(let pkey in obj.prototype){
              if (pkey !== "constructor"){
                data.prototype[pkey] = obj.prototype[pkey];
              }
            }
          }
          
          value = generateTree(data, parents+key+"/", level+1);
        }
        
        res[key] = { type, value };
      }
      
      return res;
    };
    
    var tree = generateTree(target, "", 1);
    
    var obj = {
      asObj: function(){
        return tree;
      },
      
      asText: function(){
        var lines = [ "OBJECT TREE", "===========" ];
        var grandpa = " "+(grandparent ? grandparent+"." : "");
        
        var sorter = function(entry1, entry2){
          let v = entry1[1].type - entry2[1].type;
          return v === 0 ? +(entry1[0] > entry2[0]) : v;
        };
        
        var keyRegex = /^[a-z_$][a-z0-9_$]+$/i;
        
        var getKeyAccess = function(key){
          return keyRegex.test(key) ? "."+key : "['"+key+"']";
        }
        
        var varTypes = [
          OBJTREE_VARIABLE, OBJTREE_PRIMARRAY, OBJTREE_UNKNOWN, OBJTREE_TOODEEP
        ];
        
        var addLines = function(node, parents, level){
          let entries = Object.entries(node);
          let prefix = indentstr.repeat(level)+"|-- ";
          
          let longest = Math.max.apply(null, entries
            .filter(entry => varTypes.includes(entry[1].type))
            .map(entry => (level === 0 ? entry[0] : getKeyAccess(entry[0])).length)
          );
          
          for(let [key, desc] of entries.sort(sorter)){
            let keyText = level === 0 ? key : getKeyAccess(key);
            
            if (desc.type === OBJTREE_OBJECT){
              lines.push(prefix+grandpa+parents+keyText);
              addLines(desc.value, parents+keyText, level+1);
            }
            else{
              let commonPre = prefix+OBJTREE_NAMES[desc.type]+grandpa+parents+keyText;
              
              if (desc.type === OBJTREE_SIMPLE_FUNCTION){
                lines.push(commonPre+desc.value);
              }
              else if (desc.type === OBJTREE_COMPLEX_FUNCTION){
                lines.push(commonPre+desc.value.__args.value);
                delete desc.value.__args;
                addLines(desc.value, parents+keyText, level+1);
              }
              else{
                lines.push(commonPre+(" ".repeat(longest-keyText.length))+" > "+desc.value);
              }
            }
          }
        };
        
        addLines(tree, "", 0);
        return lines.join("\n");
      },
      
      downloadText: function(filename){
        if (typeof window === "undefined"){
          throw "objtree.downloadText is only supported in a browser";
        }
        
        let url = window.URL.createObjectURL(new Blob([obj.asText()], { "type": "octet/stream" }));
        let ele = document.createElement("a");
        document.body.appendChild(ele);
        ele.href = url;
        ele.download = filename;
        ele.style.display = "none";
        ele.click();
        document.body.removeChild(ele);
        window.URL.revokeObjectURL(url);
      }
    };
    
    return obj;
  };
  
  objtree.TYPE_OBJECT = OBJTREE_OBJECT;
  objtree.TYPE_UNKNOWN = OBJTREE_UNKNOWN;
  objtree.TYPE_COMPLEX_FUNCTION = OBJTREE_COMPLEX_FUNCTION;
  objtree.TYPE_SIMPLE_FUNCTION = OBJTREE_SIMPLE_FUNCTION;
  objtree.TYPE_PRIMARRAY = OBJTREE_PRIMARRAY;
  objtree.TYPE_VARIABLE = OBJTREE_VARIABLE;
  objtree.TYPE_TOODEEP = OBJTREE_TOODEEP;
  
  if (typeof module !== "undefined" && typeof module.exports !== "undefined"){
    module.exports = objtree;
  }
  else{
    window.objtree = objtree;
  }
})();
