(function($) {
    $('#search').on('keyup change', function(event) {
        event.preventDefault();
        const search_term = $('#search').val().toLowerCase();
        const foods = $('.card-title');
        for(let i = 0; i < foods.length; i++) {
            if(foods[i].textContent.toLowerCase().includes(search_term)) {
                $(foods[i]).closest('.col')[0].style.display = 'initial';
            }
            else {
                $(foods[i]).closest('.col')[0].style.display = 'none';
            }
        }
    });
})(window.jQuery);