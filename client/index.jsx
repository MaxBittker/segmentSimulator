import React from 'react';
import ReactDOM from 'react-dom';
import Request from 'browser-request'
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/github';
import _ from 'lodash';

const languages = [
  "node",
  "ruby",
  // "python",
  // "clojure"
  // "go",
]
const methods ={
identify:
`{
  "userId": "019mr8mf4r",
  "traits": {
    "name": "Michael Bolton",
    "email": "mbolton@initech.com",
    "plan": "Enterprise",
    "friends": 42
  }
}`,
track:
`{
  "userId": "019mr8mf4r",
  "event": "Purchased an Item",
  "properties": {
    "revenue": 39.95,
    "shippingMethod": "2-day"
  }
}`,
page:
`{
  "userId": "019mr8mf4r",
  "category": "Docs",
  "name": "Node.js Library",
  "properties": {
    "url": "https://segment.com/docs/libraries/node",
    "path": "/docs/libraries/node/",
    "title": "Node.js Library - Segment",
    "referrer": "https://github.com/segmentio/analytics-node"
  }
}`,
alias:`{
  "previousId": "old_id",
  "userId": "new_id"
}`,
group:`{
  "userId": "019mr8mf4r",
  "groupId": "56",
  "traits": {
    "name": "Initech",
    "description": "Accounting Software"
  }
}`
}


class InputForm extends React.Component {
  constructor(props){
      super(props);
      this.state = {
                    errorMessage:null,
                    ticker: [],
                    runtime: "node",
                    testType: "identify",
                    inputJSON: methods['identify'],
                    writeKey: "sHkqMoS4MUEBJ87B3MDbs0WH9sGYzxwA"
                    }
  }
  sendRequest(){
      let payload = _.pick(this.state ,'runtime','testType','inputJSON','writeKey')
      Request({
            method:'POST',
            url:'api/runEvent',
            body:payload,
            json:true
          } ,(err,res,bod)=>{
        if(res.status===200){
          bod.timestamp = Date()
          this.setState({ ticker:this.state.ticker.concat(bod),
                          errorMessage:null})
        }else{
          this.setState({errorMessage:bod})
        }
        if(err) console.error(err)
      })
  }
  render() {
    let valid = false
    try {
      valid = JSON.parse(this.state.inputJSON)
    } catch (e){
      console.log(e)
    }
    let languagesOptions = languages.map(lang=>(<option key={lang} value={lang}>{lang}</option>))
    let methodOptions = Object.keys(methods).map(method=>(<option key={method} value={method}>{method}</option>))
    let tickerEntries = this.state.ticker.map((entry, i)=>
    (<div key={i}>
      <pre>{`${i} ${entry.timestamp} - ${entry.runtime} - ${entry.testType} - ${entry.writeKey} \n${entry.inputJSON}`}</pre>
     </div>
    )).reverse()

  return (
    <div className="app-container">
      <div className="error-message">{this.state.errorMessage}</div>
      <div className="input-form">
        <div className="input-form-left">
          <input
            type="text"
            value={this.state.writeKey}
            placeholder="write key"
            onChange={e => this.setState({writeKey: e.target.value})
            }
            />
          <select
            value={this.state.runtime}
            onChange={e => this.setState({runtime: e.target.value})
            }>
            {languagesOptions}
          </select>
          <select
            value= {this.state.testType}
            onChange={e => this.setState({testType: e.target.value,
                                          inputJSON: methods[e.target.value]})}>
          {methodOptions}
          </select>
        </div>
        <AceEditor
          className="ace-editor"
          value={this.state.inputJSON}
          mode="json"
          theme="github"
          onChange={v=>this.setState({inputJSON: v})}
          name="jsonEditor"
          editorProps={{$blockScrolling: Infinity}}
        />
        <button disabled={!valid} onClick={this.sendRequest.bind(this)}> send ▶</button>
      </div>
      <div className="ticker">{tickerEntries}</div>
    </div>
  );}
};
ReactDOM.render(<InputForm/>, document.getElementById('app'));
