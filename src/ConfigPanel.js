import * as React from 'react';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Dropdown, IDropdown, DropdownMenuItemType, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import Cookies from 'universal-cookie';
const cookies = new Cookies();


export class ConfigPanel extends React.Component {
  constructor(props) {
    super(props);
    this.setDefaultStart = this.setDefaultStart.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  render(){

    let items = [{"key":"None","text":"None"}]

    let defaultStart = this.props.defaultStart
    if (!defaultStart)
        defaultStart = 'None'
    return (
      <div>
        <Panel
          fullScreen open={this.props.open}
          isOpen={this.props.open}
          type={PanelType.smallFixedFar}
          onDismiss={this.props.closePanel}
          headerText="Settings"
          closeButtonAriaLabel="Close"
          onRenderFooterContent={this._onRenderFooterContent}
        >
        <Dropdown
          placeHolder={defaultStart}
          label="Set default location"
          id="Basicdrop1"
          ariaLabel="Basic dropdown example"
          options={items.concat(this.props.roomsList)}
          defaultSelectedKeys={defaultStart}
          onChanged={this.handleChange}
        />
        </Panel>
      </div>
    );
  }
  handleChange(e){
      this.setState({defaultStart:e.text})
  }

  setDefaultStart = (e) => {
    let defaultStart = this.state.defaultStart
    if(defaultStart!= "None")
        cookies.set('defaultStart', defaultStart);
    else{
        cookies.remove('defaultStart')
    }
    this.props.closePanel()
  }
  
  _onRenderFooterContent = () => {
    return (
      <div>
        <PrimaryButton onClick={this.setDefaultStart} style={{ marginRight: '8px' }}>
          Save
        </PrimaryButton>
        <DefaultButton onClick={this.props.closePanel}>Cancel</DefaultButton>
      </div>
    );
  };

  
}