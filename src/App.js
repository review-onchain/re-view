import React, { Component } from 'react';
import './App.css';
import IconexConnect from './IconexConnect';
import {
  IconConverter
} from 'icon-sdk-js'
import SDK from './SDK';
import config from './config';
import img0 from './img/1.jpg'
import img1 from './img/2.jpg'
import img2 from './img/3.jpg'
import img3 from './img/4.jpg'
import img4 from './img/5.jpg'

function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}


const MOVIE_LIST = [
  {
    title: '기생충',
    img: img0,
    id: 0,
  }, 
  {
    title: '어벤져스: 엔드게임',
    img: img1,
    id: 1,
  }, 
  {
    title: '명탐정 피카츄',
    img: img2,
    id: 2,
  }, 
  {
    title: '교회오빠',
    img: img3,
    id: 3,
  }, 
  {
    title: '어린 의뢰인',
    img: img4,
    id: 4,
  }, 
]

const SHUFFLED_MOVIE_LIST = shuffle(MOVIE_LIST)

class Card extends Component {

  state = {
    averageScore: 3.2,
    myScore: 4,
    inputValue: '3',
  }

  async componentDidMount() {
    const { movie, myAddress } = this.props
    const { iconService, callBuild } = SDK
    const averageScore = await iconService.call(
      callBuild({
        methodName: 'get_avg_of_movie',
        params: {
          idx: IconConverter.toHex(movie.id), 
        },
        to: config.CONTRACT_ADDRESS,
      })
    ).execute()
    const myScore = await iconService.call(
      callBuild({
        from: myAddress,
        methodName: 'get_my_point',
        params: {
          idx: IconConverter.toHex(movie.id), 
        },
        to: config.CONTRACT_ADDRESS,
      })
    ).execute()
    this.setState({
      averageScore: Number(averageScore) || 0,
      myScore: Number(myScore) || 0
    })
  }

  handleChange = event => {
    console.log(event.target.value)
    this.setState({inputValue: event.target.value});
  }

  render() {
    const { averageScore, myScore, inputValue } = this.state
    const { movie, handleSubmit } = this.props
    return (
      <div className="card">
        <img src={movie.img} alt={movie.title} />
        <div className="control">
          <h2 className="title">{ movie.title }</h2>
          <p>평균 평점: {'⭐'.repeat(Math.round(averageScore))} ({averageScore.toPrecision(3)})</p>
          <p>나의 평점: {'⭐'.repeat(Math.round(myScore))} ({myScore.toPrecision(3)})</p>
          <select onChange={this.handleChange} defaultValue={3} style={{ height: '23px'}} name="currency">
              <option value="1">⭐</option>
              <option value="2">⭐⭐</option>
              <option value="3">⭐⭐⭐</option>
              <option value="4">⭐⭐⭐⭐</option>
              <option value="5">⭐⭐⭐⭐⭐</option>
          </select>
          <button onClick={handleSubmit(movie.id, Number(inputValue))} className="button">평가하기</button>
        </div>
      </div>
    )
  }
}

export default class App extends Component {

  state = {
    myAddress: ''
  }

  handleLogin = async () => {
    const myAddress = await IconexConnect.getAddress()
    this.setState({
      myAddress
    })
  }

  handleSubmit = (id, inputValue) => async event => {
    if (!this.state.myAddress) {
      alert('ICONex 로그인이 필요합니다')
      return
    }

    const { sendTxBuild } = SDK
    const { myAddress } = this.state
    const txObj = sendTxBuild({
      from: myAddress,
      to: config.CONTRACT_ADDRESS,
      methodName: 'mark_movie',
      params: {
        idx: IconConverter.toHex(id), 
        point: IconConverter.toHex(inputValue), 
      },
    })
    // const txObj = sendTxBuild({
    //   from: myAddress,
    //   to: config.CONTRACT_ADDRESS,
    //   methodName: 'add_movie',
    //   params: {
    //     idx: IconConverter.toHex(id),
    //   },
    // })
    const tx = await IconexConnect.sendTransaction(txObj)
    alert('평가가 완료되었습니다.')
  }

  render() {
    const { myAddress } = this.state
    return (
      <div className="App">
        <div className="container" style={{textAlign: 'center'}}>
          <h1>RE_VIEW</h1>
          <p>Review movie on-chain.</p>
          {
            myAddress 
              ? <button>{myAddress}</button>
              : <button onClick={this.handleLogin}>ICONex</button>
          }
        </div>
        <div className="container">
          {
            myAddress && SHUFFLED_MOVIE_LIST.map((movie, i) => (
              <Card 
                key={i} 
                movie={movie} 
                handleSubmit={this.handleSubmit}
                myAddress={myAddress} 
              />
            ))
          }
        </div>
      </div>
    );
  }
}