(function webpackUniversalModuleDefinition(root, factory) {
  if(typeof root === 'undefined'){
    if(typeof window !== 'undefined'){ root = window }
    else root = {}
    root["ComposeIt"] = factory();
  }
	else if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("ComposeIt", [], factory);
	else if(typeof exports === 'object')
		exports["ComposeIt"] = factory();
	else
		root["ComposeIt"] = factory();
})(global, function() {
  
  
})