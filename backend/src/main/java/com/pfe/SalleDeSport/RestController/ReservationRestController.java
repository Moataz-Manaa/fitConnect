package com.pfe.SalleDeSport.RestController;

import org.springframework.security.access.prepost.PreAuthorize;
import com.pfe.SalleDeSport.Entity.Reservation;
import com.pfe.SalleDeSport.Service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/reservation")
public class ReservationRestController {
    @Autowired
    ReservationService reservationService;
    @GetMapping("/get-all-by-id-client/{id}")
    @PreAuthorize("@accountAccess.ownsAccount(authentication, #id)")
    public List<Reservation> listReservationByClient(@PathVariable Long id){
        return reservationService.listePlanningByClient(id);
    }

    @GetMapping("/get-all-by-id-coach/{id}")
    @PreAuthorize("@accountAccess.ownsAccount(authentication, #id)")
    public List<Reservation> listReservationByCoach(@PathVariable Long id) {
        return reservationService.getReservationByCoach(id);
    }

}
