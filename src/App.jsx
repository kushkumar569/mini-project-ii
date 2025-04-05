import { useState } from 'react'
import './App.css'
import React from "react";
import ReactDOM from "react-dom";
import Login from './components/Login/Login'
import SetRoutes from './components/SetRoutes'
import Teacher from '../src/components/HomePage/Teacher'
import Student from '../src/components/HomePage/Student'
import { RecoilRoot } from "recoil";
import Test from '../src/components/test/Test'
import View from '../src/components/HomePage/View'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <RecoilRoot>
        <SetRoutes>
          <Login />
        </SetRoutes>
      </RecoilRoot >
          {/* <View/> */}
    </>
  )
}

export default App
