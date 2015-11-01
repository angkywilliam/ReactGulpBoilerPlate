var React = require('react');
var Child =  require('./Child');

var Parent = React.createClass({
  render: function(){
    return (
      <div>
        <h1> This is the parent. </h1>
        <Child name="child"/>
      </div>
    )
  }
});

module.exports = Parent;
