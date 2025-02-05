import { useState } from 'react'
import './App.css'
import '../node_modules/bootstrap/dist/css/bootstrap.css'
import { Route, Routes } from 'react-router-dom'
import Home from './component/Home/Home'
import Register from './component/Registration/Register'
import Login from './component/Login/Login'
import Navbar from './component/Navbar/Navbar'
import NewProjectForm from './component/newproject/NewProjectForm'
import Edit from './component/Edit/Edit'
import NewTask from './component/newtask/NewTask'
import TaskEdit from './component/TaskEdit/TaskEdit'
import TaskTable from './component/Table-Data/Tabular'
import KanbanList from './component/KanbanList/KanbanList'
import AllTask from './component/Task/AllTask'
import Dashboard from './component/Dashboard/Dashboard'
import UserEdit from './component/UserEdit/UserEdit'
// import EmailForm from './component/sendemail/SendEmail'
// import 'smart-webcomponents/smart.default.css'
// import 'smart-webcomponents-react/source/styles/smart.default.css';

function App() {

  return (
    <div className='hide'>


      {/* <Home></Home> */}
      <Navbar></Navbar>
      <Routes>
        <Route path='/' element={<Home></Home>}></Route>
        <Route path='/register' element={<Register></Register>}></Route>
        <Route path='/login' element={<Login></Login>}></Route>
        <Route path='/newproject' element={<NewProjectForm></NewProjectForm>}></Route>
        <Route path='/alltask' element={<AllTask></AllTask>}></Route>
        <Route path='/newtask' element={<NewTask></NewTask>}>NewTask</Route>
        <Route path='/edit/:id' element={<Edit></Edit>}></Route>


        <Route path='/dashboard' element={<Dashboard></Dashboard>}></Route>
        <Route path='/useredit/:id' element={<UserEdit></UserEdit>}></Route>


        {/* <Route path='/showtask' element={<ShowList></ShowList>}></Route> */}
        <Route path='/kanban' element={<KanbanList></KanbanList>}></Route>
        <Route path='/taskedit/:id' element={<TaskEdit></TaskEdit>}></Route>

        <Route path='/table' element={<TaskTable ></TaskTable>}></Route>


        {/* <Route path='/email' element={<EmailForm ></EmailForm>}></Route> */}




      </Routes>

    </div>
  )
}

export default App
