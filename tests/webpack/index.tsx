import React,{Component} from 'react'
import style from './style/index.1.sass'


const TestFn = ( ) => <span>sss</span>

export default class Test extends Component {

  public render() {
    return <div>
    testssss
    <TestFn />
  </div>
  }
}