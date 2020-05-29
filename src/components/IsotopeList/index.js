import $ from "jquery";
import Isotope from "isotope-layout";
import ImagesLoaded from "imagesloaded";
import React, { Fragment } from "react";
import { push } from "react-router-redux";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { update_isotope, set_isotope } from "../../actions/isotope_actions";

import { conf_dev } from "../../config";
import Utils from "../../utils.js";
import GameCard from "../GameCard";
import GameCardDialog from "../GameCardDialog";
import GameCardsFilter from "../GameCardsFilter";
const item_gutter = {
  width: "3%"
};

const first_item_sizer = { width: Utils.calculateIsotopeItemWidthPx(3) + "px" };

const IsotopeListStyle = {
  opacity: 0
}

var imgLoaded = 0;

class IsotopeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      first_render: true,
      isotope_instance: null,
      item_size_state: {
        width: Utils.calculateIsotopeItemWidth(3) + "%"
      },
      details_dialog_state: {
        game_data: null,
        open: false
      },
      editable_items : props.editable_items ? true : false
    };
    imgLoaded = 0;
   
  }


  set_active_game_details_dialog = active_game => {
    this.setState({
      details_dialog_state: {
        active_game: active_game,
        open: true
      }
    });


  };

  updateDimensions = () => {
    if (!this.state.first_render) {
      //TODO : Debounce ?
      var newWidth = Utils.calculateIsotopeItemWidthPx(3);
      /*this.setState({
        item_size_state: {
          width: newWidth + "px"
        }
      });*/
      document.getElementsByClassName("item_sizer")[0].style.width = newWidth + "px";
      var iso_items = document.getElementsByClassName("item_iso");
      for (var i = 0; i < iso_items.length; i++) {
        iso_items[i].style.width = newWidth + "px";
      }
    }
  };

  imgLoadedCounter = () => {
    imgLoaded++;
   
    if (imgLoaded == this.props.hydrated_game_list.gameList.length) {
      
      if (this.state.first_render == true) {

        this.props.update_isotope(this.props.isotope_instance, true);
        this.setState({
          first_render: false
        });
      }
      else {
        this.props.update_isotope(this.props.isotope_instance, true);
      }

    }
  }

  //<div id="loadingding" style={{height:"1000px", width:"100%"}}> <h2>loading...</h2></div>
  render() {
    const { classes } = this.props;
    return (
      <Fragment>
        <GameCardsFilter/>
        <div id="item_list" style={IsotopeListStyle}>
          <div style={first_item_sizer} className="item_sizer" />
          <div style={item_gutter} className="item_gutter" />

          {!!this.props.hydrated_game_list &&
            this.props.hydrated_game_list.gameList.map(

              function(item, index){
               
                if(this.props.hydrated_game_list.hasOwnProperty("gameMask")){
                  if(this.props.hydrated_game_list.gameMask.hasOwnProperty(item._id)){
                    Utils.apply_game_mask(item,this.props.hydrated_game_list.gameMask[item._id]);
                  } 
                }
                
                return (
                  <GameCard 
                    key={index} 
                    game_data={item} 
                    item_width={first_item_sizer} 
                    set_active_game={this.set_active_game_details_dialog} 
                    isotope_update={this.update_isotope} 
                    imgLoadedCounter={this.imgLoadedCounter} 
                    lang={this.props.i18n.cur_lang}
                    editable_games={this.props}
                  />
                )
              }
            ,this)}
          <GameCardDialog active_game={this.state.details_dialog_state.active_game} open={this.state.details_dialog_state.open} editable={this.state.editable_items}/>
        </div>
      </Fragment>
    );


  }

  shouldComponentUpdate = (nextProps, nextState) => {
  
    if (document.getElementById("item_list").childElementCount > 3) {
      return false;
    }
    return true;
  }

  componentDidMount = () => {
    window.addEventListener("resize", this.updateDimensions);
  };

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  componentDidUpdate = (prevProps, prevState, snapshot) => {

    Object.entries(this.props).forEach(([key, val]) =>
      prevProps[key] !== val && console.log(`Prop '${key}' changed`)
    );
  };
}

//On recupere la tate dans les props
const mapStateToProps = (state, ownProps) => ({
  isotope_instance: state.isotope.isotope_instance,
  hydrated_game_list: ownProps.hydrated_game_list,
  i18n : state.i18n
});

//On injecte les actions possible au props ?
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      update_isotope,
      set_isotope
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IsotopeList);
