import React, { Fragment } from "react";
import { Link } from "react-router-dom";

import { I18n, Trans } from "react-i18next";

import AuthUserContext from "../Session/AuthUserContext";
import SignOutButton from "../SignOut";
import * as routes from "../../constants/routes";

import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Drawer from "@material-ui/core/Drawer";

import {
  authDrawerListItems,
  nonAuthDrawerListItems,
  authNavbarListItems
} from "./navigationItems";

const drawerWidth = 240;

const styles = theme => ({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: "hidden",
    position: "relative",
    display: "flex",
    width: "100%"
  },
  flex: {
    flexGrow: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  appBar: {
    position: "absolute",
    marginLeft: drawerWidth,
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidth}px)`
    }
  },
  navIconHide: {
    [theme.breakpoints.up("md")]: {
      display: "none"
    }
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
    [theme.breakpoints.up("md")]: {
      position: "relative"
    }
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3
  },
  text: {
    color: "green",
    background: "magenta"
  }
});

class Navigation extends React.Component {
  state = {
    mobileOpen: false
  };

  handleDrawerToggle = () => {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
  };

  render() {
    const { classes, theme, width } = this.props;
    return (
      <I18n ns="translations">
        {(t, { i18n }) => (
          <div className={classes.root}>
            <AuthUserContext.Consumer>
              {authUser =>
                authUser ? (
                  <NavigationAuth
                    classes={classes}
                    width={width}
                    theme={theme}
                    handleDrawerToggle={this.handleDrawerToggle}
                    mobileOpen={this.state.mobileOpen}
                  />
                ) : (
                  <NavigationNonAuth
                    classes={classes}
                    width={width}
                    theme={theme}
                    handleDrawerToggle={this.handleDrawerToggle}
                    mobileOpen={this.state.mobileOpen}
                  />
                )
              }
            </AuthUserContext.Consumer>

            <main className={classes.content}>
              <div className={classes.toolbar} />
              <Typography noWrap>
                <Trans i18nKey="description.part1">
                  To get started, edit <code>src/App.js</code> and save to reload.
                  <br/>
                </Trans>
                {"You think water moves fast? You should see ice."}
              </Typography>
            </main>
          </div>
        )}
        
      </I18n>
    );
  }

}

const NavigationAuth = props => {
  const { classes, width, theme, handleDrawerToggle, mobileOpen } = props;
  return (
    <Fragment>
      <AppBar className={classes.toolbar}>
        <Toolbar>
          {isWidthUp("sm", width) ? (
            <AuthWideScreenNavigation classes={classes} />
          ) : (
            <SmallScreenNavigation
              classes={classes}
              handleDrawerToggle={handleDrawerToggle}
            />
          )}
        </Toolbar>
      </AppBar>
      <AuthDrawer
        theme={theme}
        classes={classes}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />
    </Fragment>
  );
};

const NavigationNonAuth = props => {
  const { classes, width, theme, handleDrawerToggle, mobileOpen } = props;
  return (
    <Fragment>
      <AppBar className={classes.toolbar}>
        <Toolbar>
          {isWidthUp("sm", width) ? (
            <NonAuthWideScreenNavigation classes={classes} />
          ) : (
            <SmallScreenNavigation
              classes={classes}
              handleDrawerToggle={handleDrawerToggle}
            />
          )}
        </Toolbar>
      </AppBar>
      <NonAuthDrawer
        theme={theme}
        classes={classes}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />
    </Fragment>
  );
};

const AuthWideScreenNavigation = props => {
  const { classes } = props;
  return <Fragment>{authNavbarListItems}</Fragment>;
};

const NonAuthWideScreenNavigation = props => {
  const { classes } = props;
  return <Fragment>{nonAuthDrawerListItems}</Fragment>;
};

const SmallScreenNavigation = props => {
  const { classes, handleDrawerToggle } = props;
  console.log("smallscreen");
  return (
    <Fragment>
      <IconButton
        onClick={handleDrawerToggle}
        className={classes.menuButton}
        color="inherit"
        aria-label="Menu"
      >
        <MenuIcon />
      </IconButton>
      <Typography variant="title" color="inherit" className={classes.flex}>
        MyBoardGameCollection o/
      </Typography>
    </Fragment>
  );
};

const AuthDrawer = props => {
  const { classes, theme, handleDrawerToggle, mobileOpen } = props;
  return (
    <Drawer
      variant="temporary"
      anchor={theme.direction === "rtl" ? "right" : "left"}
      open={mobileOpen}
      onClose={handleDrawerToggle}
      classes={{
        paper: classes.drawerPaper
      }}
      ModalProps={{
        keepMounted: true // Better open performance on mobile.
      }}
    >
      <List>{authDrawerListItems}</List>
    </Drawer>
  );
};

const NonAuthDrawer = props => {
  const { classes, theme, handleDrawerToggle, mobileOpen } = props;
  return (
    <Drawer
      variant="temporary"
      anchor={theme.direction === "rtl" ? "right" : "left"}
      open={mobileOpen}
      onClose={handleDrawerToggle}
      classes={{
        paper: classes.drawerPaper
      }}
      ModalProps={{
        keepMounted: true // Better open performance on mobile.
      }}
    >
      {nonAuthDrawerListItems}
    </Drawer>
  );
};

Navigation.propTypes = {
  classes: PropTypes.object.isRequired
};
NavigationAuth.propTypes = {
  classes: PropTypes.object.isRequired
};
NavigationNonAuth.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withWidth()(withStyles(styles, { withTheme: true })(Navigation));
