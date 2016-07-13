import React from 'react';
import ReactDOM from 'react-dom';
import Request from 'browser-request'
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/github';
import _ from 'lodash';
import methods from './methodTemplates.js'

const languages = [
  'node',
  'ruby',
  // 'python',
  // 'clojure',
  // 'go',
]

//helper components
const languageOptionComponent = lang =>
  (<option key={lang} value={lang}> {lang} </option>)

const methodButtonComponent = (method, activeMethod, methodClicked ) =>
  (<button key={method} className={method===activeMethod && "active"} value={method} onClick={methodClicked}>{method}</button>)

const tickerEntryComponent = (entry, i) =>
  (<div key={i}>
    <pre>{`${i} ${entry.timestamp} - ${entry.runtime} - ${entry.testType} - ${entry.writeKey} \n${entry.inputJSON}`}</pre>
   </div>)

class InputForm extends React.Component {
  constructor(props){
      super(props);
      this.state = { //defaults
                    errorMessage:null,
                    ticker: [],
                    runtime: 'node',
                    testType: 'identify',
                    inputJSON: methods['identify'],
                    writeKey: ''//'sHkqMoS4MUEBJ87B3MDbs0WH9sGYzxwA'
                    }
  }
  sendRequest(){
      //send server subset of form state
      let payload = _.pick(this.state ,'runtime','testType','inputJSON','writeKey')
      Request({
            method:'POST',
            url:'api/runEvent',
            body:payload,
            json:true
          } ,(err,res,bod)=>{
        if(res.status === 200){
          bod.timestamp = Date()
          this.setState({ ticker:this.state.ticker.concat(bod),
                          errorMessage:null})
        }else{
          this.setState({errorMessage:bod})
        }
        if(err) console.error(err)
      })
  }
  isJSONValid(){
    try {
      JSON.parse(this.state.inputJSON)
      return true
    } catch (e){
      console.log(e)
      return false
    }
    return false
  }
  render() {

    let valid = this.isJSONValid()
    //build component lists
    let languagesOptions = languages.map(languageOptionComponent)
    let methodButtons = Object.keys(methods).map(method=>
      methodButtonComponent(method, this.state.testType, ()=>
      {this.setState({testType: method, inputJSON: methods[method]})}
    ))

    let tickerEntries = this.state.ticker.map(tickerEntryComponent).reverse()
  return (
    <div className='app-container'>
      <h1> Analytics Simulator </h1>
      <h4> Simulate an API call from any* Segment library.</h4>
      <div className='input-form'>
        <div className='input-card'>
          <input
            type='text'
            value={this.state.writeKey}
            placeholder='Write Key'
            onChange={e => this.setState({writeKey: e.target.value})
            }
            />
        </div>
        <div className='input-card col'>
          <p> Which Library?</p>
          <select
            value={this.state.runtime}
            onChange={e => this.setState({runtime: e.target.value})
            }>
            {languagesOptions}
          </select>
        </div>
        <div className='input-card'>
          {methodButtons}
        </div>
        <div className='input-card col'>
        <AceEditor
          className='ace-editor'
          value={this.state.inputJSON}
          mode='json'
          theme='github'
          onChange={v=>this.setState({inputJSON: v})}
          name='jsonEditor'
          editorProps={{$blockScrolling: Infinity}}
        />

      <button disabled={!valid} className="submit" onClick={this.sendRequest.bind(this)}> simulate</button>
      <div className='error-message'><h4>{this.state.errorMessage}</h4></div>
        </div>
      </div>

      <div className='ticker'>
        <h4>
          Successful Events:
        </h4>
        {tickerEntries}
      </div>
      <h4>*a few</h4>
    </div>
  );}
};
ReactDOM.render(<InputForm/>, document.getElementById('app'));
