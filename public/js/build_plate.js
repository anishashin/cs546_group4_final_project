(function($) {
    let foodArray = [];
    let servingArray = [];
    let counter = 1;
    $('#blankTitleError').hide();
    $('#invalidInputsError').hide();

    $('#addFoodButton').on('click', function(event) {
        $('#blankTitleError').hide();
        $('#invalidInputsError').hide();
        event.preventDefault();
        let foodDropdown =
        `<div class="row">
            <div class="col-8">
                <select id="food${counter}" class="form-select" aria-label="Select Food">`;
        foodDropdown += $('#foodDropdownTemplate').html();
        foodDropdown +=
                `</select>
            </div>
            <div class="col-4">
                <label for="servings${counter}" class="visually-hidden">Number of Servings</label>
                <input id="servings${counter}" class="form-control" placeholder="Number of Servings">
            </div>
        </div><br>`;
        $('#foodDiv').append(foodDropdown);
        counter += 1;
    });

    $('#foodDiv').on('keyup change', function(event) {
        $('#blankTitleError').hide();
        $('#invalidInputsError').hide();
        event.preventDefault();
        calculate();
    });
    
    function calculate() {
        let totalCalories = 0;
        let totalFat = 0;
        let totalCarbs = 0;
        let totalProtein = 0;
        for(let i = 1; i < counter; i++) {
            let foodId = $(`#food${i}`).val();
            let servings = parseFloat($(`#servings${i}`).val());
            if((foodId && typeof foodId === 'string' && foodId.trim() !== '' && foodId !== 'Select a food') 
                && (servings && typeof servings === 'number' && !isNaN(servings) && servings > 0)) {
                var requestConfig = {
                    method: 'GET',
                    url: '/foods/json/' + foodId
                };
                $.ajax(requestConfig).then(function(response) {
                    totalCalories += response.food.calories * servings;
                    totalFat += response.food.fat * servings;
                    totalCarbs += response.food.carbs * servings;
                    totalProtein += response.food.protein * servings;
                    $('#totalCalories').html(Math.round(totalCalories * 10) / 10);
                    $('#totalFat').html(Math.round(totalFat * 10) / 10);
                    $('#totalCarbs').html(Math.round(totalCarbs * 10) / 10);
                    $('#totalProtein').html(Math.round(totalProtein * 10) / 10);
                });
            }
        }
    }

    $('#savePlateButton').on('click', function(event) {
        $('#blankTitleError').hide();
        $('#invalidInputsError').hide();
        let isValid = true;
        event.preventDefault();
        
        foodArray = [];
        servingArray = [];
        for(let i = 1; i < counter; i++) {
            $(`#food${i}`).removeClass('is-valid is-invalid');
            $(`#servings${i}`).removeClass('is-valid is-invalid');
            let foodId = $(`#food${i}`).val();
            let servings = parseFloat($(`#servings${i}`).val());
            if(!foodId || typeof foodId !== 'string' || foodId.trim() === '' || foodId === 'Select a food') {
                $(`#food${i}`).addClass('is-invalid');
                isValid = false;
            }
            else {
                $(`#food${i}`).addClass('is-valid');
                foodArray.push(foodId);
            }
            if(!servings || typeof servings !== 'number' || isNaN(servings) || servings <= 0) {
                $(`#servings${i}`).addClass('is-invalid');
                isValid = false;
            }
            else {
                $(`#servings${i}`).addClass('is-valid');
                servingArray.push(servings);
            }
        }
        
        if(isValid) {
            $('#invalidInputsError').hide();
            if(foodArray.length > 0 && servingArray.length > 0 && foodArray.length === servingArray.length) {
                $('#savePlateModal').modal('show');
            }
            else {
                $('#invalidInputsError').show();
                $('#invalidInputsError').html('Error: No foods were selected.');
            }
        }
        else {
            $('#invalidInputsError').show();
            $('#invalidInputsError').html('Error: Invalid input(s).');
        }
    });

    $('#submitPlateButton').on('click', function(event) {
        const userId = $('#build_userId').val();
        const title = $('#title').val();
        if(!title || typeof title !== 'string' || title.trim() === '') {
            $('#blankTitleError').show();
            $('#blankTitleError').html('Error: Title cannot be blank.');
            $('#title').focus();
        }
        else {
            $('#blankTitleError').hide();
            const requestConfig = {
                method: 'POST',
                url: '/savedPlates',
                contentType: 'application/json',
                data: JSON.stringify({
                    userId: userId,
                    title: title,
                    foods: foodArray,
                    servings: servingArray
                })
            };
            $.ajax(requestConfig).then(function(response) {
                $("#savePlateModal").modal('hide');
                console.log(response);
                if(response.result === 'redirect') {
                    window.location.replace(response.url);
                }
            });
        }
    });
})(window.jQuery);