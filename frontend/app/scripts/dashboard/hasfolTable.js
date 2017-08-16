/**
 * Created by sergiopedrerobenedi on 14/8/17.
 */
$(document).ready(function(){

    // Counter
    var i = 1;

    // Add a row.
    $("#add-row").click(function(){
        var form = $("#myform");
        form.validate({
            highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            unhighlight: function(element) {
                $(element).closest('.form-group').removeClass('has-error');
            },
            errorElement: 'span',
            errorClass: 'help-block',
            errorPlacement: function(error, element) {
                if(element.parent('.input-group').length) {
                    error.insertAfter(element.parent());
                } else {
                    error.insertAfter(element);
                }
            },
            rules: {

                "it[0]":{
                    required: true,
                }

            },
            messages: {
                "it[0]": {
                    required: "IT Field is required",
                }
            }

        });
        if (form.valid() === true){
            // Populate the existing "next" row.
            $('#infotype'+i).html("<td><div class='form-group'><input type='text' class='form-control' name='it[" + i +"]' required='true' placeholder='IT Field'></div></td><td><select class='form-control'><option>Limited Adverse Effect</option><option>Serious Adverse Effect</option><option>Catastrophic Adverse Effect</option></select></td><td><select class='form-control'><option>Limited Adverse Effect</option><option>Serious Adverse Effect</option><option>Catastrophic Adverse Effect</option></select></td><td><select class='form-control'><option>Limited Adverse Effect</option><option>Serious Adverse Effect</option><option>Catastrophic Adverse Effect</option></select></td><td><button type='button' class='btn btn-default btn-sm delete'><span class='glyphicon glyphicon-trash'></span></button></td></tr>");
            $('input[name="it['+i+']"]').rules("add", {
                required: true,
                messages: {
                    required: "IT Field is required"
                }
            });

            // Append a new row to `tbody` in the DOM but not displayed in the UI.
            $('#tab_logic').append('<tr id="infotype'+(i+1)+'"></tr>');

            i++;
        }
    });

    // Delete a row.
    $('#tab_logic').on('click','.delete',function(){
        if(window.confirm("Are you sure ?")) {
            $(this).parents('tr').remove();
        }
    });
});