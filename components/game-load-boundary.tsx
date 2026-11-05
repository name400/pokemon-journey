'use client';
import {Component,type ReactNode} from 'react';

// Failed lazy imports stay rejected in this page's module graph. A user-directed
// document reload obtains the current build; never replay a game action here.
export default class GameLoadBoundary extends Component<{children:ReactNode},{failed:boolean}> {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){
  if(!this.state.failed)return this.props.children;
  return <div className="content" role="alert"><h2>게임 화면을 불러오지 못했어요</h2><p>업데이트 또는 연결 문제로 화면 파일을 불러오지 못했을 수 있어요. 새로고침하면 서버에 저장된 진행 상태를 다시 확인합니다.</p><button className="primary" onClick={()=>window.location.reload()}>화면 새로고침</button></div>;
 }
}
