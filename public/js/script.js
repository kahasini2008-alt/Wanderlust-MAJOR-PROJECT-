(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })

  const taxSwitch = document.getElementById('tax-switch')
  if (taxSwitch) {
    const formatPrice = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2
    })

    const updateListingPrices = () => {
      document.querySelectorAll('.listing-price').forEach(priceElement => {
        const basePrice = Number(priceElement.dataset.basePrice)
        const displayedPrice = taxSwitch.checked ? basePrice * 1.18 : basePrice
        priceElement.textContent = formatPrice.format(displayedPrice)
      })
    }

    taxSwitch.addEventListener('change', updateListingPrices)
    updateListingPrices()
  }
})()