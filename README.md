`objtree` is a script that generates a text tree representation of an object. The script can be executed in a browser console or imported as an `npm` module.

# How to Use

```js
var target = {};

var result = objtree(target, {
  // Maximum level of recursion
  maxlevel: 10,
  
  // Prefixed before every name (ex. window)
  grandparent: "",
  
  // String used to indent lines to display the level of nesting
  indentstr: "  ",
  
  // Array of strings (behaving like regular expressions) matched against names to exclude
  // Use / to separate nested objects (ex. {a:{b:{c:true}}} will be a/b/c)
  // Note that grandparent is not included in the name matching process
  exclude: []
});

result.asObj(); // returns internal representation of the tree
result.asText(); // returns a formatted text representation
result.downloadText(filename); // triggers a browser file download with the formatted text
```

# Example

```js
var target = {
  testBool: true,
  testInt: 15,
  testFloat: -3.6,
  testString: "text",
  testFunction: function(a, b, c){},
  testArray1: [ 1, 2, true, "abc" ],
  testArray2: [
    { hi: "there" },
    [ 0, 1, [false] ]
  ],
  testObject: {
    abc: [ 1, 2 ]
  }
};

target.testObject["testSpecial-Name!"] = null;

function MyClass(){}

MyClass.CONSTANT = true;
MyClass.data = 10;
MyClass.prototype.a = function(){};
MyClass.prototype.b = function(){};

target["testClass"] = MyClass;
```

Calling `objtree(target).asText()` with no additional settings yields (ordered by type and then name):

```
OBJECT TREE
===========
|--  testArray2
  |--  testArray2['0']
    |-- [var] testArray2['0'].hi > there
  |--  testArray2['1']
    |-- [arr] testArray2['1']['2'] > [ false ]
    |-- [var] testArray2['1']['0'] > 0
    |-- [var] testArray2['1']['1'] > 1
|--  testObject
  |-- [arr] testObject.abc                  > [ 1, 2 ]
  |-- [var] testObject['testSpecial-Name!'] > (null)
|-- [fun] testClass()
  |--  testClass.prototype
    |-- [fun] testClass.prototype.a()
    |-- [fun] testClass.prototype.b()
  |-- [var] testClass.CONSTANT > true
  |-- [var] testClass.data     > 10
|-- [fun] testFunction(a, b, c)
|-- [arr] testArray1 > [ 1, 2, true, abc ]
|-- [var] testBool   > true
|-- [var] testFloat  > -3.6
|-- [var] testInt    > 15
|-- [var] testString > text
```
