import React, { Component } from 'react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { ComboBox} from 'office-ui-fabric-react/lib/ComboBox';
import { SelectableOptionMenuItemType } from 'office-ui-fabric-react/lib/utilities/selectableOption/SelectableOption.types';
import { CommandBar, ICommandBarProps } from 'office-ui-fabric-react/lib/CommandBar';
import './App.css';
import axios from 'axios';
import {ConfigPanel} from './ConfigPanel'
import Cookies from 'universal-cookie';


initializeIcons();
const URL = "http://10.106.252.39:5000"
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
      "defaults":{}
    }
    this.handleStartChange = this.handleStartChange.bind(this);
    this.handleEndChange = this.handleEndChange.bind(this);
    this.run = this.run.bind(this)
    this.formatDropdownOptions = this.formatDropdownOptions.bind(this)
    this._closeSettingsPanel = this._closeSettingsPanel.bind(this)
    this._toggleSettingsPanel = this._toggleSettingsPanel.bind(this)
    this.loadDefaultSettings = this.loadDefaultSettings.bind(this)

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
    this.setState({url:URL+'/drawPath?start='+this.state.start +"&end="+this.state.end})
  }

  componentWillMount(){
    axios.get(URL + "/listRooms")
    .then(response => {
      this.setState({options:this.formatDropdownOptions(response.data)})
    })
    this.loadDefaultSettings()
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
      options.push({ key: 'Default', text: "Default", itemType: SelectableOptionMenuItemType.Header })
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


  render() {
    let commandBarItems=[
      {
        key: 'camera',
        icon: 'Add',
        name: 'Camera',
        ariaLabel: 'New. Use left and right arrow keys to navigate',
        onClick: () => {
          return;
        }
      },
      {
        key: 'voice',
        icon: 'Add',
        name: 'Voice',
        onClick: () => {
          return;
        }
      },
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
                    autoComplete="on"
                    label="Where do you want to go?"
                    onChanged={this.handleEndChange}
                    options={this.state.options}
                    
              />
              <PrimaryButton text="Go" onClick={this.run} />    
              
              <div>
                <img id="map_img" src={this.state.url}/>
              </div>

      </Fabric>
      </div>
    );
  }
}

export default App;