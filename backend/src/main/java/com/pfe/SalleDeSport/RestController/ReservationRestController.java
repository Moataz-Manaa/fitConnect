package com.pfe.SalleDeSport.RestController;

import com.pfe.SalleDeSport.Entity.Reservation;
import com.pfe.SalleDeSport.Dto.ReservationRequest;
import com.pfe.SalleDeSport.Service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping(value = "/reservation")
public class ReservationRestController {
    @Autowired
    ReservationService reservationService;
    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<?> ajouterReservation(@RequestBody ReservationRequest reservationrq) {
        try {
            Reservation reservation = reservationService.AjouterReservation(reservationrq);
            return new ResponseEntity<>(reservation, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("Client has already reserved this planning.")) {
                return new ResponseEntity<>("Client has already reserved this planning.", HttpStatus.CONFLICT);
            } else if (e.getMessage().contains("This planning has already been reserved the maximum number of times.")) {
                return new ResponseEntity<>("This planning has already been reserved the maximum number of times.", HttpStatus.CONFLICT);
            } else {
                return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
            }
        }
    }
    @RequestMapping("get-all-by-id-client/{id}")
    public List<Reservation> listReservationByClient(@PathVariable Long id){
        return reservationService.listePlanningByClient(id);
    }

    @GetMapping("/get-all-by-id-coach/{id}")
    public List<Reservation> listReservationByCoach(@PathVariable Long id) {
        return reservationService.getReservationByCoach(id);
    }

}
