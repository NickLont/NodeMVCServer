function autocomplete (input, latInput, lngInput) {
  if (!input) { // skip this function from running if there is no input on the page
    return
  }
  const dropdown = new google.maps.places.Autocomplete(input)

  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace()
    latInput.value = (place.geometry) ? place.geometry.location.lat().toFixed(4) : ''
    lngInput.value = (place.geometry) ? place.geometry.location.lng().toFixed(4) : ''
  })

  // If enter is hit in the form, don't submit form
  input.on('keydown', (e) => {
    if (e.keyCode === 13) {
      e.preventDefault()
    }
  })
}

export default autocomplete
