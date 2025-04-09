module.exports = function(api) {
  api.cache(true);
  
  // Check if we're in a web environment
  const isWeb = process.env.NEXT_RUNTIME === 'nodejs' || process.env.BABEL_ENV === 'web';
  
  const presets = isWeb 
    ? ['next/babel'] 
    : ['module:@react-native/babel-preset'];
    
  const plugins = isWeb
    ? []
    : ["nativewind/babel"];
    
  return {
    presets,
    plugins,
  };
};
