import React from "react";
import { Route, Redirect } from "react-router-dom";

export default ({ component: C, props: cProps, ...rest }) =>
  <Route
    {...rest}
    render={props =>  {
      let url = window.location.href;
    console.log(url);
    if(url.includes("search")){
        url = "/search";
    } 
    else url = "/login";
      return cProps.isAuthenticated
      ? <C {...props} {...cProps} />
      : <Redirect
          to={url}
        />
    }
      }
  />;
