`objtree` is a script that generates a text tree representation of an object. The script can be executed in a browser console.

# How to Use

```js
var target = {};
var result = objtree(target, {
  // Maximum level of recursion
  maxlevel: 10,
  
  // Prefixed before every name (ex. window)
  grandparent: "",
  
  // Array of strings (behaving like regular expressions) matched against names to exclude
  // Use / to separate nested objects (ex. {a:{b:{c:true}}} will be a/b/c)
  // Note that grandparent is not included in the name matching process
  exclude: []
});

result.asObj(); // returns internal representation of the tree
result.asText(); // returns a formatted text representation
result.downloadText(filename); // triggers a browser file download with the formatted text
```

# Examples

TODO
