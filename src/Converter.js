import React, { useState } from 'react';
import { Link, useParams } from "react-router-dom";
//======================    Files    ========================//
import './Converter.css';
import si_prefixes from "./units-si-prefixes.json";
import back_icon from "./images/back-icon.png";
import swap_icon from "./images/swap-icon.png";
//=====================    Components    ====================//
import UnitSelector from "./UnitSelector.js";
//===========================================================//


const Converter = () =>
{
  //type is e.g. "length":
  let {type} = useParams();

  //units contains units of the selected type, eg "length":
  let units = require("./quantity-lists/" + type + ".json");

  // https://reactjs.org/docs/hooks-intro.html :
  // My understanding: unit1 is a variable, changed by the function setUnit1. 
  // These are, using a hook, connected and affected by a state. A state 
  //  is useful because it rerenders components that use unit1, when updated
  //  through setUnit1.
  let [unit1, setUnit1] = useState(units[0].name); 
  let [unit2, setUnit2] = useState(units[1].name);
  

  // Changes the unit (which one is decided by number), to e, which comes from
  //  the onChangeValue attribute for the UnitSelector component, which in turn 
  //  is called from within that component's file. The reason that I use both
  //  "unit1 = e" and "setUnit1(e)" is because (for the text that is sent by
  //  the attribute selectedUnit to UnitSelector needs to be rerendered 
  //  (by setUnit1), but if I use setUnit1 only, it doesn't update it the value
  //  of unit1 instantly, which is a necessity for when the convert function is 
  //  called below. Therefore, I also need to write "unit1 = e" to make it work: 
  const changeUnit = (number, e) =>
  {
    if(number === 1)
    {
      setUnit1(e);
      unit1 = e;
    }
    else
    {
      setUnit2(e);
      unit2 = e;
    }
    
    convert();
  }


  // Returns the object in the array of filtered units (from the JSON file)
  //  that has the same name as inName:
  let getUnitByName = inName =>
  {
    return units.find(u => u.name === inName);
  }


  // Swaps the upper and lower units and the numbers in the input and output boxes:
  const swap = () =>
  {
    let fromElement = document.getElementById("from-box");
    let toElement = document.getElementById("to-box");
    let temp; //temporary variable that is used to be able to swap values.

    temp = fromElement.value;
    fromElement.value = toElement.innerHTML;
    toElement.innerHTML = temp;

    temp = unit1;
    setUnit1(unit2);
    setUnit2(temp);
  }


  const convert = () =>
  {
    let fromElement = document.getElementById("from-box");
    let toElement = document.getElementById("to-box");
    let convConst = 1; //conversion constant.

    // Checks so that the entered value in input is a value (e.g. doesn't contain any letters)
    //  and isn't empty. Otherwise, the output box is set empty and the function doesn't continue.
    if(isNaN(fromElement.value) || fromElement.value.length == 0)
    {
      toElement.innerHTML = "";
      return;
    }

    let fromUnit = getUnitByName(unit1);
    let toUnit = getUnitByName(unit2);

    //checks whether the upper unit has a prefix to a "main" unit (e.g. CENTImeter):
    if(fromUnit.siPrefix != null) 
    {
      let foundPrefix = si_prefixes.find(prefix => prefix.name === fromUnit.siPrefix);

      convConst *= foundPrefix.value;

      fromUnit = getUnitByName(fromUnit.belongsTo);
    }

    //checks whether the lower unit has a prefix to a "main" unit:
    if(toUnit.siPrefix != null) 
    {
      let foundPrefix = si_prefixes.find(prefix => prefix.name === toUnit.siPrefix);

      convConst /= foundPrefix.value;

      toUnit = getUnitByName(toUnit.belongsTo);
    }

    //checks if the upper and lower units are the same (might also have changed through 
    // the code above). This check is done because otherwise the statement at "else if" 
    // would be run, because fromUnit.conversions is empty if it's a "main" unit 
    // (without prefix), see units.JSON.
    if(fromUnit.name == toUnit.name)
    {
      //do nothing
    }
    else if(fromUnit.conversions[toUnit.name] == null)
    {
      //this should'nt happen though:
      alert("ERROR... conversion data missing...");
      return;
    }
    else
    {
      //everything works, update the conversion constant:
      convConst = convConst * fromUnit.conversions[toUnit.name];
    }

    //update the output box to the converted value (input multiplied by conversion constant):
    toElement.innerHTML = fromElement.value * convConst;
  }


  return(
    <div id="return-converter">
      <div id="header">
        <Link to="/">
          <img src={back_icon} id="back-icon"/>
        </Link>
        <p><span>Unit Converter:</span> {type}</p>
      </div>

      <p className="label">From:</p>

      <div className="unit-selector-box">
        <input id="from-box" className="ioBox input" type="text" onChange={convert}/>
        <UnitSelector units={units} selectedUnit={unit1} onChangeValue={e => changeUnit(1, e)} />
      </div>
      
      <div className="centered">
        <img src={swap_icon} onClick={swap} id="swap-icon"/>
      </div>
      
      <p className="to-label label">To:</p>

      <div className="unit-selector-box">
        <p id="to-box" className="ioBox output"></p>
        <UnitSelector units={units} selectedUnit={unit2} onChangeValue={e => changeUnit(2, e)} />
      </div>
    </div>
  );
}
export default Converter;
