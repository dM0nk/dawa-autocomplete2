import { autocompleteUi } from './autocomplete-ui.js';
import { AutocompleteController } from './autocomplete-controller.js';

export function dawaAutocomplete(inputElm, options) {
  options = Object.assign({ select: () => null }, options);
  const controllerOptions = [
    'baseUrl',
    'minLength',
    'params',
    'fuzzy',
    'stormodtagerpostnumre',
    'supplerendebynavn',
    'completeType',
    'showCity'
  ].reduce((memo, optionName) => {
    if (options.hasOwnProperty(optionName)) {
      memo[optionName] = options[optionName];
    }
    return memo;
  }, {});
  if (options.adgangsadresserOnly) {
    controllerOptions.type = 'adgangsadresse';
  } else {
    controllerOptions.type = 'adresse';
  }

  const controller = new AutocompleteController(controllerOptions);
  const ui = autocompleteUi(inputElm, {
    onSelect: suggestion => {
      controller.select(suggestion);
    },
    onTextChange: (newText, newCaretpos) => {
      controller.update(newText, newCaretpos);
    },
    render: options.render,
    multiline: options.multiline || false
  });
  controller.setRenderCallback(suggestions => ui.setSuggestions(suggestions));
  controller.setSelectCallback(selected => {
    if ('completeType' in controllerOptions) {
      if (controllerOptions.completeType === 'postnummer') {
        if ('showCity' in controllerOptions && controllerOptions.showCity === true) {
          ui.selectAndClose(selected.tekst);
        } else {
          ui.selectAndClose(selected.postnummer.nr);
        }
      }

      if (controllerOptions.completeType === 'adresse') {
        if ('showCity' in controllerOptions && controllerOptions.showCity === false) {
          const streetNameAndNumber = selected.data.vejnavn + ' ' + selected.data.husnr;
          const floor = selected.data.etage ? selected.data.etage : null;
          const door = selected.data.dør ? selected.data.dør : null;

          var street = streetNameAndNumber;

          if (floor !== null) {
            street += ', ' + floor;
          }

          if (door !== null) {
            street += '. ' + door;
          }

          ui.selectAndClose(street);
        }
      }
    } else {
      ui.selectAndClose(selected.tekst);
    }

    options.select(selected);
  });
  controller.setInitialRenderCallback(text => ui.selectAndClose(text));
  if (options.id) {
    controller.selectInitial(options.id);
  }
  return {
    id: id => controller.selectInitial(id),
    destroy: () => ui.destroy(),
    selected: () => controller.selected
  };
}
