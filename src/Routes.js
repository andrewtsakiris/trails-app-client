import React from "react";
import { Route, Switch } from "react-router-dom";
import Profile from "./containers/Profile";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import Search from "./containers/Search";


export default () =>
  <Switch>
    <Route path="/" exact component={Profile} />
    <Route path="/login" exact component={Login}/>
    <Route path="/signup" exact component={Signup}/>
    <Route path="/search" exact component={Search}/>
  </Switch>;
