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

const methodOptionComponent = method =>
  (<option key={method} value={method}>{method}</option>)

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
    let methodOptions = Object.keys(methods).map(methodOptionComponent)
    let tickerEntries = this.state.ticker.map(tickerEntryComponent).reverse()

  return (
    <div className='app-container'>
      <div className='error-message'>{this.state.errorMessage}</div>
      <div className='input-form'>
        <div className='input-form-left'>
          <input
            type='text'
            value={this.state.writeKey}
            placeholder='write key'
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
          className='ace-editor'
          value={this.state.inputJSON}
          mode='json'
          theme='github'
          onChange={v=>this.setState({inputJSON: v})}
          name='jsonEditor'
          editorProps={{$blockScrolling: Infinity}}
        />
        <button disabled={!valid} onClick={this.sendRequest.bind(this)}> send ▶</button>
      </div>
      <div className='ticker'>Successful Events:{tickerEntries}</div>
    </div>
  );}
};
ReactDOM.render(<InputForm/>, document.getElementById('app'));
