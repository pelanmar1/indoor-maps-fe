import React, { Component } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { ComboBox} from 'office-ui-fabric-react/lib/ComboBox';
import { SelectableOptionMenuItemType } from 'office-ui-fabric-react/lib/utilities/selectableOption/SelectableOption.types';
import { CommandBar, ICommandBarProps } from 'office-ui-fabric-react/lib/CommandBar';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Modal } from 'office-ui-fabric-react/lib/Modal';



import './App.css';
import axios from 'axios';
import {ConfigPanel} from './ConfigPanel'
import Cookies from 'universal-cookie';


initializeIcons();
const URL = "http://localhost:5000"
//const URL = "https://floo-be.azurewebsites.net"

const cookies = new Cookies();

class App extends Component {

  constructor(props){
    super(props)
    this.state = {
      "url":URL,
      "start":"",
      "end":"",
      "options":[],
      "showSettingsPanel":false,
      "defaults":{},
      "closestSelectedConference":false,
      "closestSelectedFocus":false,
      "showModal": false,
      "disableInstructions":true,
      "directions":""
    }
    this.handleStartChange = this.handleStartChange.bind(this);
    this.handleEndChange = this.handleEndChange.bind(this);
    this.run = this.run.bind(this)
    this.formatDropdownOptions = this.formatDropdownOptions.bind(this)
    this._closeSettingsPanel = this._closeSettingsPanel.bind(this)
    this._toggleSettingsPanel = this._toggleSettingsPanel.bind(this)
    this.loadDefaultSettings = this.loadDefaultSettings.bind(this)
    this._onCheckbox2Change = this._onCheckbox2Change.bind(this)
    this._onCheckbox1Change = this._onCheckbox1Change.bind(this)
    this._showModal = this._showModal.bind(this)
    this._closeModal = this._closeModal.bind(this)

  }

/* ------ Settings Panel ------ */  
  _toggleSettingsPanel = () => {
    this.setState({showSettingsPanel: !this.state.showSettingsPanel});
  };
  _closeSettingsPanel() {
    this.setState({showSettingsPanel: false})
 }
  /* --------------------------- */

 

  /* ------ Text inputs  ------ */

  loadDefaultSettings(){
      let defaults = this.state.defaults
      defaults.start = cookies.get('defaultStart')
      this.setState({defaults:defaults})
      return defaults
  }

  handleStartChange(e){
    if(e && e.text)
      this.setState({start:e.key});
  }
  handleEndChange(e){
    if(e && e.text)
      this.setState({end:e.key});
  }
  /* --------------------------- */

  run(e){
    if(!this.state.start){
      alert("Please check your input.")
    }else{
    if(this.state.closestSelectedConference){
      this.setState({url:URL+'/drawPathClosest?start='+this.state.start +"&end_type=Conference"})  
    }else if (this.state.closestSelectedFocus){
      this.setState({url:URL+'/drawPathClosest?start='+this.state.start +"&end_type=Focus"})  
    }else{
      this.setState({url:URL+'/drawPath?start='+this.state.start +"&end="+this.state.end})
    }
    let url= URL+'/directions?start='+this.state.start +"&end="+this.state.end
    axios.get(url)
    .then(response => {
      if(response.data){
        this.setState({directions:response.data,disableInstructions:false})
      }
    })
  }
  }

  componentWillMount(){
    axios.get(URL + "/listRooms")
    .then(response => {
      this.setState({options:this.formatDropdownOptions(response.data)})
    })
    this.loadDefaultSettings()
  }

  _onCheckbox1Change(e){
    this.setState({closestSelectedFocus:!this.state.closestSelectedFocus})

  }
  _onCheckbox2Change(e){
    this.setState({closestSelectedConference:!this.state.closestSelectedConference})

  }
  
  
  formatDropdownOptions(lists){
    let defaultStart = this.state.defaults.start?this.state.defaults.start:null
    const _textToKey = function(text){
      return text.replace(" ","_")
    }
    if(!lists || lists.length == 0)
      return [];
    const options = []
    if(defaultStart){
      options.push({ key: 'Default', text: "Favorites", itemType: SelectableOptionMenuItemType.Header })
      options.push({ key: _textToKey(defaultStart), text: this.state.defaults.start})
    }
    options.push({ key: 'Header', text: 'Room Name', itemType: SelectableOptionMenuItemType.Header })
    lists["room_names"].map( function(item) {
      if(!defaultStart || item != defaultStart){
        let temp = { key: _textToKey(item), text: item};
        options.push(temp);
      }
    });
    options.push({ key: 'divider_1', text: '-', itemType: SelectableOptionMenuItemType.Divider })
    options.push({ key: 'Header2', text: 'Room Code', itemType: SelectableOptionMenuItemType.Header })
    lists["room_codes"].map( function(item) {
      let temp = { key: item, text: item};
      options.push(temp);
    });
    options.push({ key: 'divider_2', text: '-', itemType: SelectableOptionMenuItemType.Divider })
    options.push({ key: 'Header3', text: 'Room Id', itemType: SelectableOptionMenuItemType.Header })
    lists["vertex_ids"].map( function(item) {
      let temp = { key: item, text: "Room # " + item};
      options.push(temp);
    });
    return options;
  }
  _showModal() {
    this.setState({ showModal: true });
  };

  _closeModal(){
    this.setState({ showModal: false });
  };


  render() {
    let commandBarItems=[
      {
        key: 'settings',
        icon: 'Add',
        name: 'Settings',
        onClick: () => {
          this._toggleSettingsPanel()
          return;
        }
      }
    ]

    let defaultStart = this.state.defaults.start?this.state.defaults.start:null
    let settingsRoomList = this.state.options.slice(2,this.state.options.length)
    
    return (
      <div className="App">
        <header className="App-header">
          <h1>Room Finder</h1>
        </header>
        <Fabric>
                <ConfigPanel open={this.state.showSettingsPanel} closePanel={this._closeSettingsPanel} roomsList={settingsRoomList} defaultStart={this.state.defaults.start}/>
                <div >
                <CommandBar className="cr_commandbar"
                  items={commandBarItems}
                  //overflowItems={overflowItems}
                  //#farItems={farItems}
                  ariaLabel={'Use left and right arrow keys to navigate between commands'}
                />
              </div>
              <ComboBox className="cr_combobox"
                    allowFreeform={true}
                    autoComplete="on"
                    label="Where are you?"
                    onChanged={this.handleStartChange}
                    options={this.state.options}
                    //errorMessage="Error! Here is some text!"
              />
              <ComboBox className="cr_combobox"
                    allowFreeform={true}
                    disabled = {this.state.closestSelectedFocus || this.state.closestSelectedConference}
                    autoComplete="on"
                    label="Where do you want to go?"
                    onChanged={this.handleEndChange}
                    options={this.state.options}
                    
              />
              <div>
              <Label>Find closest:</Label>
              <Checkbox className="cr_checkbox" label="Focus Room" onChange={this._onCheckbox1Change}  />
                <Checkbox className="cr_checkbox" label="Conference Room" onChange={this._onCheckbox2Change}  />
      
            </div>
              <PrimaryButton text="Go" onClick={this.run} />    
              

<div>
        <DefaultButton   id="cr_instructions_btn" onClick={this._showModal} text="Show instructions" disabled={this.state.disableInstructions}/>
        <Modal
          isOpen={this.state.showModal}
          onDismiss={this._closeModal}
          isBlocking={false}
          
        >
          <div className="ms-modalExample-header">
            <span>Directions</span>
          </div>
          <div className="ms-modalExample-body">
              {this.state.directions}
          </div>
        </Modal>
      </div>

              <div>
                <img id="map_img" src={this.state.url}/>
              </div>

      </Fabric>
      </div>
    );
  }
}

export default App;
