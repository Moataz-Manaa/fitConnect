package com.pfe.SalleDeSport.Repository;

import com.pfe.SalleDeSport.Entity.CheckoutPurchase;
import com.pfe.SalleDeSport.Entity.CheckoutPurchase.Kind;
import com.pfe.SalleDeSport.Entity.CheckoutPurchase.State;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Collection;
import java.util.Optional;

public interface CheckoutPurchaseRepository extends JpaRepository<CheckoutPurchase, String> {
    Optional<CheckoutPurchase> findByClientIdAndProductIdAndKindAndState(Long clientId, Long productId, Kind kind, State state);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<CheckoutPurchase> findByProviderSessionId(String providerSessionId);

    long countByKindAndProductIdAndState(Kind kind, Long productId, State state);

    boolean existsByKindInAndProductIdAndState(Collection<Kind> kinds, Long productId, State state);

    boolean existsByClientIdAndState(Long clientId, State state);
}
