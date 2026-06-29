## Πιθανές μελλοντικές επεκτάσεις

Με βάση ό,τι έχεις τώρα (Sheets backend, fuel/service/expenses, Drive αποδείξεις, dashboard), αυτά είναι τα πιο λογικά επόμενα βήματα:

### Άμεσα χρήσιμα (MVP → πλήρες προϊόν)

1. ~~**Επεξεργασία καταχωρήσεων**~~ — ✅ Edit σε fuel/service/expenses (`/fuel/edit`, `/service/edit`, `/expenses/edit` + PUT APIs).
2. ~~**Φίλτρα & αναζήτηση**~~ — ✅ Αναζήτηση + φίλτρα ημερομηνίας/χιλιομέτρων/κατηγορίας/πρατηρίου στις λίστες.
3. ~~**Υπενθυμίσεις service**~~ — ✅ Banner στο dashboard/service, browser notifications, mailto email.
4. **Αποδείξεις παντού** — Τώρα μόνο σε καύσιμα· ίδιο flow για service και έξοδα.

### Analytics & reporting

5. ~~**Μηνιαία/ετήσια αναφορά**~~ — ✅ PDF export, επιλογή μήνα/έτους, σύγκριση περιόδων, κόστος ανά km.
6. **Πρόβλεψη κόστους** — «Με αυτή την κατανάλωση, ~X€/μήνα» από ιστορικό.
7. **Σύγκριση πρατηρίων** — Μέση τιμή/λίτρο ανά Shell/EKO/BP.

### UX & mobile

8. ~~**PWA offline**~~ — ✅ Service worker + IndexedDB queue για νέες καταχωρήσεις, auto-sync όταν επανέλθει δίκτυο.
9. **OCR απόδειξης** — Φωτογραφία → αυτόματη συμπλήρωση λίτρων/ποσού (Google Vision ή παρόμοιο).
10. **Widget / shortcut** — «+ Γέμισμα» από home screen χωρίς να ανοίγεις την εφαρμογή.

### Υποδομή (όταν ξεπεράσεις το Sheets)

11. **Multi-user** — Σήμερα ένα Sheet· ξεχωριστό sheet/tab ανά χρήστη ή μετάβαση σε DB (Supabase, Postgres).
12. **Πολλά οχήματα** — Ένα profile· extension για 2+ αυτοκίνητα στην οικογένεια.
13. **Backup/export** — CSV/Excel download όλων των tabs, scheduled backup στο Drive.

### Integrations

14. **Calendar reminders** — Ήδη fuel events· επέκταση για service due dates.
15. **Fuel price API** — Σύγκριση «πλήρωσες X€/L vs μέση τιμή περιοχής».
16. **Apple/Google Wallet** — Κάρτα ασφάλειας/KTEO με expiry reminder.

---

**Προτεραιότητα που θα έβαζα εγώ:**

| Φάση | Features |
|------|----------|
| **Τώρα** | Edit entries, φίλτρα, υπενθυμίσεις service |
| **Μετά** | Αποδείξεις παντού, μηνιαία αναφορά PDF |
| **Αργότερα** | Multi-vehicle, OCR, PWA offline |

Αν θες να ξεκινήσουμε κάτι συγκεκριμένο, το πιο impactful με μικρό effort είναι **edit καταχωρήσεων** — η υποδομή (PATCH API, revalidate) υπάρχει ήδη για fuel.