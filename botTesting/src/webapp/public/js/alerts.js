/**
 * Created by shankarkumarc on 19/12/17.
 */
function alertWarning(type,msg) {
  console.log("alert",type,msg)
  var alert = `
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                <strong>`+type+`</strong> `+msg+`
                <button type="button" class="close"  data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
`
  $('.alertInfo').prop('innerHTML', alert);
}

function alertSuccess(type,msg) {
  var alert = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <strong>`+type+`</strong> `+msg+`
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
`
  $('.alertInfo').prop('innerHTML', alert)
}

function alertDanger(type,msg) {
  var alert = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>`+type+`</strong> `+msg+`
                <button type="button" class="close"  data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
`
  $('.alertInfo').prop('innerHTML', alert)
}

function alertInfo(type,msg) {
  var alert = `
            <div class="alert alert-info alert-dismissible fade show" role="alert">
                <strong>`+type+`</strong> `+msg+`
                <button type="button" class="close"  data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
`
  $('.alertInfo').prop('innerHTML', alert)
}