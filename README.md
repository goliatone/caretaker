# Caretaker

Health check module

Daemon TTL health check. The module provides an API endpoint to which any long running process has to check-in periodically. If the long running process does not check-in in time, a terminate event will be emitted.


## Getting Started
Install the module with: `npm install caretaker`

```javascript
var caretaker = require('caretaker');
caretaker.awesome(); // "awesome"
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Roadmap
- Merge with Serene
- Handle saving/loading state.

## Release History
_(Nothing yet)_

## License
Copyright (c) 2016 goliatone  
Licensed under the MIT license.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).
